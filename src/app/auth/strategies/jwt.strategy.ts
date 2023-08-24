import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AuthConfig {
  readonly key: string;
}
export interface Payload {
  sub: string;
  username: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<AuthConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<AuthConfig>('auth', {
        infer: true,
      }).key,
    });
  }

  async validate(payload: Payload) {
    const { sub, username, email } = payload;
    return {
      userId: sub,
      username: username,
      email: email,
    };
  }
}
