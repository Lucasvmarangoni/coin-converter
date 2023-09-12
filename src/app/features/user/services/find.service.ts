import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { UserInfo } from '../../../auth/models/user-info';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FindUsersService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(usernameOrEmail: string): Promise<UserInfo | undefined> {
    let user: UserInfo;

    if (this.isEmail(usernameOrEmail)) {
      user = await this.userModel.findOne<UserInfo>({ email: usernameOrEmail });
    } else {
      user = await this.userModel.findOne<UserInfo>({
        username: usernameOrEmail,
      });
    }
    const cached = await this.cacheManager.get<UserInfo>(`user:${user.id}`);
    if (cached) {
      return cached;
    }
    const ttl5days = 432 * 1000000;
    this.cacheManager.set(`user:${user.id}`, user, ttl5days);
    return user;
  }

  isEmail(email: string) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }
}
