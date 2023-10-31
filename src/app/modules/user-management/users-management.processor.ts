import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { UserCreatedEvent } from '@src/app/common/events/user-created-event';
import { LoggerService } from '@src/app/common/loggers/custom/logger.service';
import { User } from '@src/app/models/user';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor('users')
export class UsersManagementProcessor {
  constructor(
    private readonly loggerService: LoggerService,
    @InjectModel('UserModel')
    private readonly userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.loggerService.contextName = UsersManagementProcessor.name;
  }

  @Process('user.creating')
  async verify(data: Job<UserCreatedEvent>) {
    this.loggerService.info(`Called method: ${this.verify.name}()`);

    try {
      const userCreation = this.userModel.create(data.data.user);

      userCreation
        .then(() => {
          this.eventEmitter.emit('user.created', data.data.user);
          this.loggerService.info(`USER CREATED SUCCESSFULLY`);
        })
        .catch((err) => {
          this.eventEmitter.emit('user.created.failed', err);
          this.loggerService.error(`USER CREATION FAILED: ${err.message}`);
        });

      await userCreation;
    } catch (err) {
      this.loggerService.error(`${err.message}`);
      throw err;
    }
  }
}
