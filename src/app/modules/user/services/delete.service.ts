import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IsEmail } from 'class-validator';

class UserEmail {
  @IsEmail()
  email: string;
}

@Injectable()
export class DeleteService {
  constructor(
    @InjectModel('UserModel')
    private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async execute(user_email: UserEmail): Promise<void> {
    const { email } = user_email;

    this.cacheManager.del(`user:${email}`);
    this.cacheManager.del(`transactions:${email}`);
    await this.userModel.deleteOne({ email: email });
  }
}
