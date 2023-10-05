import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from '../config/config.module';
import { AppLoggerModule } from './modules/logger.module';
import { AppMongooseModule } from './modules/mongoose.module';
// import { AppAuthModule } from './app/auth/auth.module';
import { AppModules } from './app/modules/modules.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './app/common/err/exception.filter';
import { AppCacheModule } from './modules/cache.module';
import { AppThrottlerModule } from './modules/throttler.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppClientModule,
    AppModules,
    AppMongooseModule,
    // AppAuthModule,
    AppCacheModule,
    AppThrottlerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
