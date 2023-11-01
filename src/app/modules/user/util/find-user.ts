import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/modules/user/domain/models/user';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserInfo } from '@src/app/common/interfaces/user-info';

@Injectable()
export class FindUser {
  ttl5days = 432 * 1000000;

  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findOne(usernameOrEmail: string): Promise<UserInfo | null> {
    if (this.isEmail(usernameOrEmail)) {
      return this.findUserByEmail(usernameOrEmail);
    } else {
      return this.findUserByUsername(usernameOrEmail);
    }
  }

  private async findUserByEmail(email: string): Promise<UserInfo | null> {
    const cachedUser = await this.getUserFromCache(email);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findOne<UserInfo>({ email });
    if (user) this.setUserToCache(email, user);
    return user;
  }

  private async findUserByUsername(username: string): Promise<UserInfo | null> {
    return this.userModel.findOne<UserInfo>({ username });
  }

  private async getUserFromCache(key: string): Promise<UserInfo | undefined> {
    return this.cacheManager.get<UserInfo>(`user:${key}`);
  }

  private setUserToCache(key: string, user: UserInfo | undefined): void {
    if (user) {
      this.cacheManager.set(`user:${key}`, user, this.ttl5days);
    }
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
