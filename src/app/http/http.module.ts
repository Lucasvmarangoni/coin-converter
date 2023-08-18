import { Module } from '@nestjs/common';
import { ConverterController } from './controllers/converter-controller';
import { UserController } from './controllers/user-controller';
import { AppAuthModule } from '../auth/auth.module';
import { AppServiceModule } from '../services/service.module';
import { AuthController } from './controllers/auth-controller';

@Module({
  imports: [
    AppAuthModule,
    AppServiceModule,
],
  controllers: [ConverterController, UserController, AuthController], 
})
export class AppHttpModule {}
