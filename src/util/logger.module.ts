import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from 'config.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('LOGGER_LEVEL'),
          enabled: configService.get<boolean>('LOGGER_ENABLED'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppLoggerModule {}
