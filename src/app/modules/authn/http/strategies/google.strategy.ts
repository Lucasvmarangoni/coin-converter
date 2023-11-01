import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '@src/app/modules/authn/domain/services/auth.service';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';
import { AuthGoogle } from '@src/app/modules/authn/interface/auth-google';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<string, true>
  ) {
    super({
      clientID: configService.get<AuthGoogle>('auth', {
        infer: true,
      }).google.id,
      clientSecret: configService.get<AuthGoogle>('auth', {
        infer: true,
      }).google.secret,
      callbackURL: `http://localhost:${configService.get<string>('container', {
        infer: true,
      })}/api/google/redirect`,
      scope: ['profile', 'email'],
    });
    this.configService;
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    if (profile.emails?.[0]?.value) {
      const user = await this.authService.googleValidateUser({
        email: profile.emails[0].value,
        name: profile.displayName,
      });
      return user;
    } else {
      throw new Error(`Email address not provided, something is wrong!"`);
    }
  }
}
