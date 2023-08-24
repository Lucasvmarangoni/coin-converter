import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from '../config/config.module';
import { AppLoggerModule } from './util/logger.module';
import { AppMongooseModule } from './mongoose.module';
import { AppFeaturesModule } from './app/features.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppClientModule,
    AppFeaturesModule,
    AppMongooseModule,
  ],
})
export class AppModule {}
