import { Module } from '@nestjs/common';
import { AppConverterModule } from './converter/converter.module';
import { AppUserModule } from './user/user.module';
import { AppAuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppBullModule } from '@src/app/common/queues/bull.module';
import { AppUserManagementModule } from './user-management/users-management.module';

@Module({
  imports: [
    AppConverterModule,
    AppUserManagementModule,
    AppUserModule,
    AppAuthModule,
    EventEmitterModule.forRoot(),
    AppBullModule,
  ],
})
export class AppModules {}
