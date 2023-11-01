import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';
import {
  LoginRequestBodyByEmail,
  LoginRequestBodyByUsername,
} from '@src/app/modules/authn/interface/login-request';

@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
  async use(req: Request, _: Response, next: NextFunction) {
    const body = req.body;
    let loginRequestBody, validations: any;

    if (body.username) {
      loginRequestBody = new LoginRequestBodyByUsername();
      loginRequestBody.username = body.username;
      loginRequestBody.password = body.password;
      validations = await validate(loginRequestBody);
    } else if (body.email) {
      loginRequestBody = new LoginRequestBodyByEmail();
      loginRequestBody.email = body.email;
      loginRequestBody.password = body.password;
      validations = await validate(loginRequestBody);
    }

    if (validations.length) {
      throw new BadRequestException(
        validations.reduce(
          (
            acc: any,
            curr: { constraints: { [s: string]: unknown } | ArrayLike<unknown> }
          ) => {
            return [...acc, ...Object.values(curr.constraints)];
          },
          []
        )
      );
    }

    next();
  }
}
