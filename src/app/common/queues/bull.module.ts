import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          port: configService.get<{ port: string }>('redis', {
            infer: true,
          }).port,
          host: configService.get<{ host: string }>('redis', {
            infer: true,
          }).host,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppBullModule {}
