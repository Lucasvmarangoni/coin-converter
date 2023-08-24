import { Module } from '@nestjs/common';
import { CreateUserService } from './services/create.service';
import { DeleteAllUsersService } from './services/delete.service';
import { FindUsersService } from './services/find.service';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [AppDatabaseModule],
  providers: [CreateUserService, FindUsersService, DeleteAllUsersService],
  controllers: [UserController],
  exports: [AppDatabaseModule, FindUsersService],
})
export class AppUserModule {}
