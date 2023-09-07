import { Module } from '@nestjs/common';
import { CreateService } from './services/create.service';
import { DeleteService } from './services/delete.service';
import { FindUsersService } from '../../auth/find.service';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [AppDatabaseModule],
  providers: [CreateService, FindUsersService, DeleteService],
  controllers: [UserController],
  exports: [AppDatabaseModule, FindUsersService],
})
export class AppUserModule {}
