import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Transaction } from 'ioredis/built/transaction';

@Injectable()
export class DeleteService {
  constructor(
    @InjectModel('TransactionModel')
    private readonly transactionsModel: Model<Transaction>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(user: User): Promise<void> {
    this.cacheManager.del(`user:${user.email}`);
    await this.transactionsModel.deleteMany({ user: user.id });
  }
}
