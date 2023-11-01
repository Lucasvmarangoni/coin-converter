/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserInfo } from '@src/app/common/interfaces/user-info';
import { FindUser } from '@src/app/modules/user/util/find-user';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private findUser: FindUser) {
    super();
  }

  serializeUser(user: UserInfo, done: Function) {
    done(null, user);
  }

  async deserializeUser(payload: UserInfo, done: Function) {
    const user = await this.findUser.findOne(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
