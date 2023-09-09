import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '@src/app/models/transactions';
import { ResponseData } from '../models/converter-models';

@Injectable()
export class FindAllService {
  constructor(
    @InjectModel('TransactionModel')
    private transactionsModel: Model<Transaction>,
  ) {}

  execute(user: string): Promise<ResponseData[]> {
    return this.transactionsModel.find({ user: user });
  }
}
