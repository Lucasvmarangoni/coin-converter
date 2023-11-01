import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';
import { AuthService } from './domain/services/auth.service';
import { LocalStrategy } from './http/strategies/local.strategy';
import { AuthConfig, JwtStrategy } from './http/strategies/jwt.strategy';
import { AuthController } from './http/controller/auth.controller';
import { LoginValidationMiddleware } from './http/middlewares/login-validation.middleware';
import { IdentifyFieldMiddleware } from './http/middlewares/identify-field.middleware';
import { GoogleStrategy } from './http/strategies/google.strategy';
import { SessionSerializer } from './http/serializer/google-serializer';
import { AppUserModule } from '@src/app/modules/user/user.module';

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
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    SessionSerializer,
    // {
    //   provide: APP_GUARD,
    //   useValue: JwtAuthGuard,
    // },
  ],
})
export class AppAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login'),
      consumer.apply(IdentifyFieldMiddleware).forRoutes('login');
  }
}
