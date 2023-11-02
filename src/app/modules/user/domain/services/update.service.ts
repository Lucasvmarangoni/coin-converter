import {
  CreateUserRequest,
  UserProps,
} from '@src/app/modules/user/domain/services/interfaces/user-models';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { HashPassword } from './util/hash-password';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserResponse } from '@src/app/modules/user/domain/services/interfaces/user-res';
import { InjectQueue } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { UserUpdatedEvent } from '@src/app/common/events/user-updated-event';

@Injectable()
export class UpdateService {
  constructor(
    private readonly findUser: FindUser,
    private readonly hashPassword: HashPassword,
    @InjectQueue('users')
    private usersQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async execute(
    currentEmail: string,
    req: Partial<CreateUserRequest>
  ): Promise<UserResponse | null> {
    const { name, username, email, password } = req;
    const user = await this.findUser.findOne(currentEmail);
    let hashPassword, response;

    if (password) hashPassword = await this.hashPassword.hash(password);

    if (user) {
      const updateData = {
        id: user.id,
        name: name || user.name,
        username: username || user.username,
        email: email || user.email,
        password: hashPassword || user.password,
        createdAt: user.createdAt,
      };
      await this.emitUserUpdatedEvent(currentEmail, updateData);
      await this.cache(currentEmail, updateData);
      (updateData.password as any) = undefined;
      (updateData.id as any) = undefined;
      response = updateData;
    }

    return response ? { user: response } : null;
  }

  private async emitUserUpdatedEvent(
    currentEmail: string,
    updateData: UserProps
  ): Promise<void> {
    const waitForUserUpdated = new Promise<void>((resolve, reject) => {
      this.eventEmitter.once('user.updated', resolve);
      this.eventEmitter.once('user.updated.failed', reject);
    });
    try {
      await this.usersQueue.add(
        'user.updating',
        new UserUpdatedEvent(currentEmail, updateData)
      );

      await waitForUserUpdated;
    } catch (err) {
      throw new BadRequestException(
        err.message.includes('duplicate key')
          ? 'This user already exist. Try with other username or email.'
          : err.message,
        {
          cause: new Error(),
          description: 'mongoose validation error',
        }
      );
    }
  }

  private async cache(currentEmail: string, updateData: UserProps) {
    if (currentEmail !== updateData.email) {
      await this.cacheManager.del(`user:${currentEmail}`);
      await this.cacheManager.set(`user:${updateData.email}`, updateData);
    } else {
      await this.cacheManager.set(`user:${currentEmail}`, updateData);
    }
  }
}
