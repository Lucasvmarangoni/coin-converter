import { Inject, UnauthorizedException } from '@nestjs/common';
import { FindUsersService } from './find.service';
import { UserResponse } from './models/user-models';
import { ReqProps } from './models/req-props';

export class ProfileService {
  constructor(
    @Inject(FindUsersService)
    private readonly findUsersService: FindUsersService,
  ) {}

  async execute(req: ReqProps): Promise<UserResponse> {
    const { id, username, email } = req;
    const user = await this.findUsersService.findOne(email);
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
