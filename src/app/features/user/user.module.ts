import { Module } from '@nestjs/common';
import { CreateService } from './services/create.service';
import { DeleteService } from './services/delete.service';
import { FindUsersService } from './util/find-user';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UserController } from './controllers/user.controller';
import { CreateForOAuth } from './services/create.oauth.service';
import { ProfileService } from './services/profile.service';
import { UpdateService } from './services/update.service';
import { HashPassword } from './services/util/hash-password';

@Module({
  imports: [AppDatabaseModule],
  providers: [
    CreateService,
    FindUsersService,
    DeleteService,
    CreateForOAuth,
    ProfileService,
    UpdateService,
    HashPassword,
  ],
  controllers: [UserController],
  exports: [
    AppDatabaseModule,
    FindUsersService,
    CreateForOAuth,
    ProfileService,
  ],
})
export class AppUserModule {}
