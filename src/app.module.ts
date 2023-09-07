import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from '../config/config.module';
import { AppLoggerModule } from './util/logger.module';
import { AppMongooseModule } from './mongoose.module';
import { AppAuthModule } from './app/auth/auth.module';
import { AppFeaturesModule } from './app/features/features.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './app/auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './httt-exception-filter';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppClientModule,
    AppFeaturesModule,
    AppMongooseModule,
    AppAuthModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useValue: JwtAuthGuard,
    // },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
