import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthConfig, JwtStrategy } from './strategies/jwt.strategy';
import { FindUsersService } from '../features/user/services/find.service';

@Module({
  imports: [
    PassportModule,
    ,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AuthConfig>) => ({
        secret: configService.get<AuthConfig>('auth', {
          infer: true,
        }).key,
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
  providers: [
    AuthService,
    LocalStrategy,
    ConfigService,
    JwtStrategy,
    FindUsersService,
    JwtService,
  ],
})
export class AppAuthModule {}
