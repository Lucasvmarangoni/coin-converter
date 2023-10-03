import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@src/app/models/user';
import * as bcrypt from 'bcrypt';
import { UserPayload } from '../models/user-payload';
import { UserToken } from '../models/user-token';
import { UserGoogleData } from '../models/user-google-data';
import { UserLocalData } from '../models/user-local-data';
import { UserInfo } from '../models/user-info';
import { UserResponse } from '../models/user-response';
import { CreateForOAuth } from '../../user/services/create.oauth.service';
import { FindUser } from '../../user/util/find-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly findUser: FindUser,
    private readonly jwtService: JwtService,
    private readonly createForOAuth: CreateForOAuth,
  ) {}

  async googleValidateUser(
    userData: UserGoogleData,
  ): Promise<Omit<UserResponse, 'password'>> {
    const user = await this.findUser.findOne(userData.email);

    if (user) {
      user.password = undefined;
      return user;
    }
    await this.createForOAuth.execute(userData);
    const newUser = await this.findUser.findOne(userData.email);
    newUser.password = undefined;
    return newUser;
  }

  async localValidateUser(
    userData: UserLocalData,
  ): Promise<Omit<UserResponse, 'password'>> {
    const { usernameOrEmail, password } = userData;

    if (!usernameOrEmail) {
      throw new Error('Username or email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    const user: UserInfo = await this.findUser.findOne(usernameOrEmail);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { id, email, username, createdAt } = user;
      const result = { id, username, email, createdAt };

      return result;
    }
    return null;
  }

  login(user: User): UserToken {
    const { id, name, username, email } = user;
    const payload: UserPayload = {
      sub: id,
      name,
      username,
      email,
    };
    const jwtToken = this.jwtService.sign(payload);

    return {
      access_token: jwtToken,
    };
  }

  public static async hashPassword(
    password: string,
    salt = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
