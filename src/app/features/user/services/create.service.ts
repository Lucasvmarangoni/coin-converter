import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '@src/app/auth/auth.service';

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserProps extends CreateUserRequest {
  createdAt: Date;
}

export interface UserResponse {
  user: Omit<UserProps, 'password'>;
}

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
      throw new BadRequestException('mongoose validation error', {
        cause: new Error(),
        description: 'Some provided value to be invalid',
      });
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
