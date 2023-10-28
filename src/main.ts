import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { HttpExceptionFilter } from './app/common/err/exception.filter';
import { swagger } from './docs/swagger';
import session from 'express-session';
import passport from 'passport';
import { ValidationPipe } from '@nestjs/common';

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3333);
  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: configService.get<{ secret: string }>('auth', {
        infer: true,
      }).secret,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  swagger(app);
  await app.listen(port);
})();
