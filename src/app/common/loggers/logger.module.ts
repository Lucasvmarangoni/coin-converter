import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            customProps: () => ({
              context: 'HTTP',
            }),
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
