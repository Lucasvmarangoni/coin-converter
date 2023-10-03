import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { HttpExceptionFilter } from './app/common/err/httt-exception-filter';
import { swagger } from './docs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3333);
  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: configService.get<{ secret: string }>('auth').secret,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  swagger(app);
  await app.listen(port);
})();
