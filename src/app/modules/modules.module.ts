import { Module } from '@nestjs/common';
import { AppConverterModule } from './converter/converter.module';
import { AppUserModule } from './user/user.module';
import { AppAuthModule } from './authn/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppBullModule } from '@src/app/common/queues/bull.module';

@Module({
  imports: [
    AppConverterModule,
    AppUserModule,
    AppAuthModule,
    EventEmitterModule.forRoot(),
    AppBullModule,
  ],
})
export class AppModules {}
