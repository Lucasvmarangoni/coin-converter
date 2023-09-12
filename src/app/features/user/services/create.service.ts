import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '@src/app/auth/auth.service';
import {
  CreateUserRequest,
  UserResponse,
  UserProps,
} from './models/user-models';

@Injectable()
export class CreateService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
  ) {}

  async execute(req: CreateUserRequest): Promise<UserResponse> {
    const { email, name, username } = req;
    let { password } = req;

    password = await this.hashPassword(password);

    const user: UserProps = {
      name,
      username,
      email,
      password,
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

  private async hashPassword(password: string): Promise<string> {
    if (password) {
      const hashedPassword = await AuthService.hashPassword(password);
      password = hashedPassword;
    }
    return password;
  }
}
