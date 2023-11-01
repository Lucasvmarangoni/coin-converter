import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserPayload } from '@src/app/modules/authn/interface/user-payload';
import { UserToken } from '@src/app/modules/authn/interface/user-token';
import { UserGoogleData } from '@src/app/common/interfaces/user-google-data';
import { UserLocalData } from '@src/app/modules/authn/interface/user-local-data';
import { UserInfo } from '@src/app/common/interfaces/user-info';
import { CreateForOAuth } from '@src/app/modules/user/domain/services/create.oauth.service';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { UserFromJwt } from '@src/app/modules/authn/interface/user-from-jwt';
import { UserResponse } from '@src/app/modules/authn/interface/user-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly findUser: FindUser,
    private readonly jwtService: JwtService,
    private readonly createForOAuth: CreateForOAuth
  ) {}

  async googleValidateUser(userData: UserGoogleData): Promise<UserResponse | null> {
    const user = await this.findUser.findOne(userData.email);

    if (user) {
      (user.password as any) = undefined;
      return user;
    }
    await this.createForOAuth.execute(userData);
    const newUser = await this.findUser.findOne(userData.email);
    if (newUser) (newUser.password as any) = undefined;
    return newUser;
  }

  async localValidateUser(userData: UserLocalData): Promise<UserResponse | null> {
    const { usernameOrEmail, password } = userData;

    if (!usernameOrEmail) {
      throw new Error('Username or email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    const user = (await this.findUser.findOne(usernameOrEmail)) as UserInfo;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { id, email, username, createdAt } = user;
      const result = { id, username, email, createdAt };

      return result;
    }
    return null;
  }

  login(user: UserFromJwt): UserToken {
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

  public static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
