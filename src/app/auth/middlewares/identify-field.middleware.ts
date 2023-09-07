import { Injectable, NestMiddleware } from '@nestjs/common';
import { FindUsersService } from '@src/app/auth/find.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IdentifyFieldMiddleware implements NestMiddleware {
  constructor(private findUsersService: FindUsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { body } = req;
    if ('username' in body) {
      const user = await this.findUsersService.findOne(body.username);
      req.body = {
        ...body,
        email: user.email,
      };
    }
    next();
  }
}
