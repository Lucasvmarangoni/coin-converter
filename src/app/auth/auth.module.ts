import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthConfig, JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AppUserModule } from '../features/user/user.module';
import { LoginValidationMiddleware } from './middlewares/login-validation.middleware';
import { IdentifyFieldMiddleware } from './middlewares/identify-field.middleware';

@Module({
  imports: [
    AppUserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService<AuthConfig>) => ({
        secret: configService.get<AuthConfig>('auth', {
          infer: true,
        }).key,
        signOptions: { expiresIn: '60000s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AppAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login'),
      consumer.apply(IdentifyFieldMiddleware).forRoutes('login');
  }
}
