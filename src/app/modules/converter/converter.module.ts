import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { ConverterService } from './services/converter.service';
import { FindAllService } from './services/find-all.service';
import { AppDatabaseModule } from '@src/database/database.module';
import { ConverterController } from './controllers/converter.controller';
import { DeleteService } from './services/delete.service';

@Module({
  imports: [AppClientModule, AppDatabaseModule],
  providers: [FindAllService, ConverterService, DeleteService],
  controllers: [ConverterController],
  exports: [FindAllService, ConverterService],
})
export class AppConverterModule {}
