import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '@src/app/models/transactions';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ResponseData } from '@src/app/modules/converter/interfaces/response';

@Injectable()
export class FindAllService {
  constructor(
    @InjectModel('TransactionModel')
    private readonly transactionsModel: Model<Transaction>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async execute(id: string, email: string): Promise<ResponseData[]> {
    const cached = await this.cacheManager.get<ResponseData[]>(`transactions:${email}`);
    if (cached) {
      return cached;
    }
    const find = await this.transactionsModel.find({ user: id });
    await this.cacheManager.set(`transactions:${email}`, find);
    return find;
  }
}
