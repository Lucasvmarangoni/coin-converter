import { Module } from '@nestjs/common';
import { AppHttpModule } from './app/http/http.module';
import { AppClientModule } from '@src/client/client.module';
import { AppConfigModule } from './config.module';
import { AppLoggerModule } from './util/logger.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppClientModule,
    AppHttpModule,
    MongooseModule.forRoot(process.env.DATABASE_URL),    
  ],

})
export class AppModule { }
