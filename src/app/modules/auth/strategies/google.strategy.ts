import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthGoogle } from '../models/auth-google';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService<string, true>,
  ) {
    super({
      clientID: configService.get<AuthGoogle>('auth', {
        infer: true,
      }).google.id,
      clientSecret: configService.get<AuthGoogle>('auth', {
        infer: true,
      }).google.secret,
      callbackURL: `http://localhost:${configService.get<string>('port', {
        infer: true,
      })}/api/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.googleValidateUser({
      email: profile.emails[0].value,
      name: profile.displayName,
    });
    return user;
  }
}
