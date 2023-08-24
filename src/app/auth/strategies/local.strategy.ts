import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@src/app/models/user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' } && { usernameField: 'username' });
  }

  async validate(
    usernameOrEmail: string,
    password: string,
  ): Promise<Partial<User>> {
    const user = await this.authService.validateUser(usernameOrEmail, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
