import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserRequest, UserProps } from './models/user-models';
import { HashPassword } from './util/hash-password';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@src/app/common/events/user-created-event';
import { ResponseProps } from './models/response.props';
import { UserResponse } from './models/user-res';

@Injectable()
export class CreateService {
  constructor(
    private readonly hashPassword: HashPassword,
    @InjectQueue('users')
    private usersQueue: Queue,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(req: CreateUserRequest): Promise<UserResponse> {
    const user = await this.createUser(req);
    await this.emitUserCreatedEvent(user);

    const response: ResponseProps = {
      ...user,
      password: undefined,
    };

    return { user: response };
  }

  private async createUser(userData: Omit<UserProps, 'createdAt'>): Promise<UserProps> {
    const { name, username, email, password } = userData;
    const hashPassword = await this.hashPassword.hash(password);

    const user: UserProps = {
      name,
      username,
      email,
      password: hashPassword,
      createdAt: new Date(),
    };

    return user;
  }

  private async emitUserCreatedEvent(user: UserProps): Promise<void> {
    const waitForUserCreated = new Promise<void>((resolve, reject) => {
      this.eventEmitter.once('user.created', resolve);
      this.eventEmitter.once('user.created.failed', reject);
    });

    try {
      await this.usersQueue.add('user.creating', new UserCreatedEvent(user));
      await waitForUserCreated;
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

  // @OnEvent('user.created', { async: true })
  // async welcomeNewUser() {
  //   await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  //   console.info('USER CREATED SECCESSFULLY');
  // }
}
