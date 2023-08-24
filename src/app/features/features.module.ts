import { Module } from '@nestjs/common';
import { AppConverterModule } from './converter/converter.module';
import { AppUserModule } from './user/user.module';

@Module({
  imports: [AppConverterModule, AppUserModule],
})
export class AppFeaturesModule {}
