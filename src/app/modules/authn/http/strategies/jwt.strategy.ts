import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';
import { UserPayload } from '@src/app/modules/authn/interface/user-payload';
import { UserFromJwt } from '@src/app/modules/authn/interface/user-from-jwt';

export interface AuthConfig {
  readonly key: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<AuthConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<AuthConfig>('auth', {
        infer: true,
      }).key,
    });
    this.configService;
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
