import { Injectable, NestMiddleware } from '@nestjs/common';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IdentifyFieldMiddleware implements NestMiddleware {
  constructor(private findUser: FindUser) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { body } = req;
    if ('username' in body) {
      const user = await this.findUser.findOne(body.username);
      req.body = {
        ...body,
        email: user.email,
      };
    }
    next();
  }
}
