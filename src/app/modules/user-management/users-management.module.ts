import { Module } from '@nestjs/common';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { UsersManagementProcessor } from './users-management.processor';
import { AppCustomLoggerModule } from '@src/app/common/loggers/custom/logger.module';

@Module({
  imports: [AppDatabaseModule, AppCustomLoggerModule],
  providers: [UsersManagementProcessor],
})
export class AppUserManagementModule {}
