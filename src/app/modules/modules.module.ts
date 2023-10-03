import { Module } from '@nestjs/common';
import { AppConverterModule } from './converter/converter.module';
import { AppUserModule } from './user/user.module';
import { AppAuthModule } from './auth/auth.module';

@Module({
  imports: [AppConverterModule, AppUserModule, AppAuthModule],
})
export class AppModules {}
