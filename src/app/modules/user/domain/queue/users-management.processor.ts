import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { UserCreatedEvent } from '@src/app/common/events/user-created-event';
import { LoggerService } from '@src/app/common/loggers/custom/logger.service';
import { User } from '@src/app/modules/user/domain/models/user';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserUpdatedEvent } from '@src/app/common/events/user-updated-event';

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
  async createdVerify(data: Job<UserCreatedEvent>) {
    this.loggerService.info(`Called method: ${this.createdVerify.name}()`);

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

  @Process('user.updating')
  async updatedVerify(data: Job<UserUpdatedEvent>) {
    this.loggerService.info(`Called method: ${this.updatedVerify.name}()`);

    try {
      const userUpdation = this.userModel.updateOne(
        { email: data.data.user.email },
        data.data.user
      );

      userUpdation
        .then(() => {
          this.eventEmitter.emit('user.updated', data.data.user);
          this.loggerService.info(`USER UPDATED SUCCESSFULLY`);
        })
        .catch((err) => {
          this.eventEmitter.emit('user.updated.failed', err);
          this.loggerService.error(`USER UPDATED FAILED: ${err.message}`);
        });

      await userUpdation;
    } catch (err) {
      this.loggerService.error(`${err.message}`);
      throw err;
    }
  }
}
