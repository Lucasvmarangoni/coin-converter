import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '@src/app/models/user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(
    usernameOrEmail: string,
    password: string,
  ): Promise<Partial<User>> {
    const user = await this.authService.localValidateUser({
      usernameOrEmail,
      password,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
