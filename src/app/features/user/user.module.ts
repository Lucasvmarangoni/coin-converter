import { Module } from '@nestjs/common';
import { CreateService } from './services/create.service';
import { DeleteService } from './services/delete.service';
import { FindUsersService } from './services/find.service';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UserController } from './controllers/user.controller';
import { CreateForOAuth } from './services/create.oauth.service';

@Module({
  imports: [AppDatabaseModule],
  providers: [CreateService, FindUsersService, DeleteService, CreateForOAuth],
  controllers: [UserController],
  exports: [AppDatabaseModule, FindUsersService, CreateForOAuth],
})
export class AppUserModule {}
