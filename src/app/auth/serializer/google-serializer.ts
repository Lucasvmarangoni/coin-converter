/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { User } from '@src/app/models/user';
import { FindUsersService } from '../../features/user/services/find.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private findUsersService: FindUsersService,
  ) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('Serializer User');
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await this.findUsersService.findOne(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
