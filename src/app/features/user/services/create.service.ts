import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Injectable } from '@nestjs/common';
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
export class CreateUserService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
  ) {}

  async execute(req: CreateUserRequest): Promise<UserResponse> {
    const { email, name, username } = req;
    let { password } = req;

    if (password) {
      const hashedPassword = await AuthService.hashPassword(password);
      password = hashedPassword;
    }
    const user: UserProps = {
      name,
      username,
      email,
      password,
      createdAt: new Date(),
    };

    await this.userModel.create(user);

    const response: UserProps = {
      ...user,
      password: undefined,
    };
    return { user: response };
  }
}
