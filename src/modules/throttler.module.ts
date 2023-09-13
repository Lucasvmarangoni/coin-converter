import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ttlOneHour } from './util/ttl-rate-limiter';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: ttlOneHour,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: ttlOneHour,
        limit: 20,
      },
      {
        name: 'long',
        ttl: ttlOneHour * 2,
        limit: 30,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppThrottlerModule {}
