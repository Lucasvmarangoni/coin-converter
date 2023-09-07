import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@src/app/models/user';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './models/user-payload';
import { UserToken } from './models/user-token';
import { FindUsersService, UserInfo } from './find.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly findUsersService: FindUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    usernameOrEmail: string,
    pass: string,
  ): Promise<Partial<User>> {
    if (!usernameOrEmail) {
      throw new Error('Username or email is required');
    }
    if (!pass) {
      throw new Error('Password is required');
    }
    const user: UserInfo = await this.findUsersService.findOne(usernameOrEmail);

    const isPasswordValid = await bcrypt.compare(pass, user.password);

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
