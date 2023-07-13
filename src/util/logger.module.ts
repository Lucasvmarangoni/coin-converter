import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            },
            level: configService.get<string>('logger.level'),
            enabled: configService.get<boolean>('logger.enabled'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppLoggerModule {}
