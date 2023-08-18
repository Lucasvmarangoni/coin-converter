import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transactions, TransactionSchema } from '@src/app/models/transactions';
import { Users, UserSchema } from '@src/app/models/user';
import { AppClientModule } from '@src/client/client.module';
import { ConverterService } from './converter/converter';
import { FindAllService } from './converter/find-all';
import { CreateUserService } from './user/create.service';
import { DeleteAllUsersService } from './user/delete.service';

@Module(
    {
        imports: [
            AppClientModule,
            MongooseModule.forFeature([
                { name:'TransactionModel', schema: TransactionSchema },
                { name: 'UserModel', schema: UserSchema },
            ]),
        ],
        providers: [
            CreateUserService, 
            FindAllService, 
            DeleteAllUsersService, 
            ConverterService
        ],
        exports: [
            MongooseModule, 
            CreateUserService, 
            FindAllService, 
            DeleteAllUsersService,
            ConverterService, 
            FindAllService
        ],
    }
)
export class AppServiceModule {}

