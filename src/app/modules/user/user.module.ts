import { Module } from '@nestjs/common';
import { CreateService } from './services/create.service';
import { DeleteService } from './services/delete.service';
import { FindUser } from './util/find-user';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UserController } from './controllers/user.controller';
import { CreateForOAuth } from './services/create.oauth.service';
import { ProfileService } from './services/profile.service';
import { UpdateService } from './services/update.service';
import { HashPassword } from './services/util/hash-password';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    AppDatabaseModule,
    BullModule.registerQueue({
      name: 'users',
    }),
  ],
  providers: [
    CreateService,
    FindUser,
    DeleteService,
    CreateForOAuth,
    ProfileService,
    UpdateService,
    HashPassword,
  ],
  controllers: [UserController],
  exports: [AppDatabaseModule, FindUser, CreateForOAuth, ProfileService],
})
export class AppUserModule {}
