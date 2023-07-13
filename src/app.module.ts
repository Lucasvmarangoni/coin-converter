import { Module } from '@nestjs/common';
import { AppHttpModule } from './app/http/http.module';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from './config.module';
import { AppLoggerModule } from './util/logger.module';

@Module({
  imports: [AppConfigModule, AppLoggerModule, AppClientModule, AppHttpModule],
})
export class AppModule {}
