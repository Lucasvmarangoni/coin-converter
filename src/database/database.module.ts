import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from '../app/modules/converter/domain/models/transactions';
import { UserSchema } from '@src/app/modules/user/domain/models/user';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TransactionModel', schema: TransactionSchema },
      { name: 'UserModel', schema: UserSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class AppDatabaseModule {}
