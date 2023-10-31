/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@src/app/models/user';
import { FindUser } from '@src/app/modules/user/util/find-user';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private findUser: FindUser) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user);
  }
  // usar o UserPayload no lugar do any, depois que eu corrigir o bug
  async deserializeUser(payload: any, done: Function) {
    const user = await this.findUser.findOne(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
