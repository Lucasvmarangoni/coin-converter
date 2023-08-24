import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './transactions';
import { UserSchema } from './user';

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
