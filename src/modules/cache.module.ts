import { Module } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: await configService.get('cache').host,
        port: await configService.get('cache').port,
        ttl: await configService.get('cache').ttl,
        max: await configService.get('cache').max,
        password: await configService.get('cache').password,
        // no_ready_check: true,
      }),
      inject: [ConfigService],
    }),
  ],
  // providers: [
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useClass: CacheInterceptor,
  //   },
  // ],
})
export class AppCacheModule {}
