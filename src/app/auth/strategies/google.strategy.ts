import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService<string, true>,
  ) {
    super({
      clientID: 'test-cliend-id',
      clientSecret: 'test-secret',
      callbackURL: `http://localhost:${configService.get<string>('port', {
        infer: true,
      })}/api/auth/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.googleValidateUser({
      email: profile.emails[0].value,
      displayName: profile.displayName,
    });
    return user;
  }
}
