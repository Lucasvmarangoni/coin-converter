/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@src/app/models/user';
import { FindUsersService } from '../../features/user/util/find-user';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private findUsersService: FindUsersService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await this.findUsersService.findOne(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
