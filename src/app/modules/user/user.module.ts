import { Module } from '@nestjs/common';
import { CreateService } from './domain/services/create.service';
import { DeleteService } from './domain/services/delete.service';
import { FindUser } from './util/find-user';
import { AppDatabaseModule } from '@src/database/database.module';
import { UserController } from './controllers/user.controller';
import { CreateForOAuth } from './domain/services/create.oauth.service';
import { ProfileService } from './domain/services/profile.service';
import { UpdateService } from './domain/services/update.service';
import { HashPassword } from './domain/services/util/hash-password';
import { BullModule } from '@nestjs/bull';
import { AppCustomLoggerModule } from '@src/app/common/loggers/custom/logger.module';
import { UsersManagementProcessor } from './domain/queue/users-management.processor';

@Module({
  imports: [
    AppCustomLoggerModule,
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
    UsersManagementProcessor,
  ],
  controllers: [UserController],
  exports: [AppDatabaseModule, FindUser, CreateForOAuth, ProfileService],
})
export class AppUserModule {}
