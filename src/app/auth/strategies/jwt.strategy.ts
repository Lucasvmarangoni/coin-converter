import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from '../models/user-payload';
import { UserFromJwt } from '../models/user-from-jwt';

export interface AuthConfig {
  readonly key: string;
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

  async validate(payload: UserPayload): Promise<UserFromJwt> {
    const { sub, username, name, email } = payload;
    return {
      id: sub,
      name,
      username,
      email,
    };
  }
}
