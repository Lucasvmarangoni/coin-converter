import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { UserInfo } from '../../../auth/models/user-info';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FindUser {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(usernameOrEmail: string): Promise<UserInfo | undefined> {
    let user: UserInfo;

    if (this.isEmail(usernameOrEmail)) {
      const cached = await this.cacheManager.get<UserInfo>(
        `user:${usernameOrEmail}`,
      );
      if (cached) {
        return cached;
      }
      const ttl5days = 432 * 1000000;
      user = await this.userModel.findOne<UserInfo>({ email: usernameOrEmail });
      this.cacheManager.set(`user:${usernameOrEmail}`, user, ttl5days);
    } else {
      user = await this.userModel.findOne<UserInfo>({
        username: usernameOrEmail,
      });
    }

    return user;
  }

  async findAllUsernames(): Promise<string[]> {
    const cached = await this.cacheManager.get<string[]>(`usernames`);
    if (cached) {
      return cached;
    }
    const users = await this.userModel.find({}, 'username');
    const usernames = users.map((user) => user.username);
    const ttl5days = 432 * 1000000;
    this.cacheManager.set(`usernames`, usernames, ttl5days);

    return usernames;
  }

  isEmail(email: string) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }
}
