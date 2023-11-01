import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { ReqProps } from './interfaces/req-props';
import { UserResponse } from './interfaces/user-res';

@Injectable()
export class ProfileService {
  constructor(private readonly findUser: FindUser) {}

  async execute(req: ReqProps): Promise<UserResponse> {
    const { id, username, email } = req;
    const user = await this.findUser.findOne(email);

    if (!user) {
      throw new NotFoundException('User not found', {
        cause: new Error(),
        description: 'NotFound',
      });
    }

    const { name, createdAt } = user;

    const response = {
      user: {
        name,
        username,
        email,
        createdAt,
      },
    };
    if (id === user.id && username === user.username) {
      return response;
    }
    throw new UnauthorizedException('Unauthorized', {
      cause: new Error(),
      description: 'Access denied!',
    });
  }
}
