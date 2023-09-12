import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DeleteService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(user: User): Promise<void> {
    this.cacheManager.del(`user:${user.id}`);
    await this.userModel.deleteOne({ id: user.id });
  }
}
