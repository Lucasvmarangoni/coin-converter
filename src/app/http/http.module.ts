import { Module } from '@nestjs/common';
import { ConverterController } from './controllers/converter-controller';
import { ConverterService } from '../services/converter';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema, Transactions } from '../models/transactions';
import { AppClientModule } from '@src/client/client.module';
import { FindAllService } from '../services/find';

@Module({
  imports: [
    AppClientModule,
    MongooseModule.forFeature([
    { name: Transactions.name, schema: TransactionSchema },
  ]),  
],
  controllers: [ConverterController],
  providers: [ConverterService, FindAllService],
})
export class AppHttpModule { }
