import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from '../config/config.module';
import { AppLoggerModule } from './util/logger.module';
import { AppMongooseModule } from './mongoose.module';
import { AppAuthModule } from './app/auth/auth.module';
import { AppFeaturesModule } from './app/features/features.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppClientModule,
    AppFeaturesModule,
    AppMongooseModule,
    AppAuthModule,
  ],
})
export class AppModule {}
