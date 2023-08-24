import { Module } from '@nestjs/common';
import { AppUserModule } from './features/user/user.module';
import { AppConverterModule } from './features/converter/converter.module';

@Module({
  imports: [AppConverterModule, AppUserModule],
})
export class AppFeaturesModule {}
