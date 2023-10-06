import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserRequest,
  UserResponse,
  UserProps,
} from './models/user-models';
import { HashPassword } from './util/hash-password';

@Injectable()
export class CreateService {
  constructor(
    @InjectModel('UserModel')
    private readonly userModel: Model<User>,
    private readonly hashPassword: HashPassword,
  ) {}

  async execute(req: CreateUserRequest): Promise<UserResponse> {
    const { email, name, username, password } = req;

    const hashPassword = await this.hashPassword.hash(password);

    const user: UserProps = {
      name,
      username,
      email,
      password: hashPassword,
      createdAt: new Date(),
    };
    try {
      await this.userModel.create(user);
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
    const response: UserProps = {
      ...user,
      password: undefined,
    };
    return { user: response };
  }
}
