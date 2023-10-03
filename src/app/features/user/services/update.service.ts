import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import {
  CreateUserRequest,
  UserProps,
  UserResponse,
} from './models/user-models';
import { FindUser } from '../util/find-user';
import { HashPassword } from './util/hash-password';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UpdateService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
    private readonly findUser: FindUser,
    private readonly hashPassword: HashPassword,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(
    firstEmail: string,
    req: Partial<CreateUserRequest>,
  ): Promise<UserResponse> {
    const { name, username, email, password } = req;
    const user = await this.findUser.findOne(firstEmail);

    const hashPassword = await this.hashPassword.hash(password);

    const updateData = {
      id: user.id,
      name: name || user.name,
      username: username || user.username,
      email: email || user.email,
      password: hashPassword || user.password,
      createdAt: user.createdAt,
    };
    await this.update(firstEmail, updateData);

    const response: UserProps = {
      name: updateData.name,
      username: updateData.username,
      email: updateData.email,
      createdAt: updateData.createdAt,
      password: undefined,
    };
    await this.cache(firstEmail, updateData);
    return { user: response };
  }

  private async update(firstEmail: string, updateData: UserProps) {
    try {
      await this.userModel.updateOne({ email: firstEmail }, updateData);
    } catch (err) {
      throw new BadRequestException(
        err.message.includes('duplicate key')
          ? 'This user already exist. Try with other username or email.'
          : err.message,
        {
          cause: new Error(),
          description: 'mongoose validation error',
        },
      );
    }
  }

  private async cache(firstEmail: string, updateData: UserProps) {
    if (firstEmail !== updateData.email) {
      await this.cacheManager.del(`user:${firstEmail}`);
      await this.cacheManager.set(`user:${updateData.email}`, updateData);
    } else {
      await this.cacheManager.set(`user:${firstEmail}`, updateData);
    }
  }
}
