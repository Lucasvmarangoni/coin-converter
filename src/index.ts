import ApiError, { APIError } from '@src/util/err/api-error';
import { Logger, Injectable } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';

@Injectable()
export abstract class BaseController {
  private readonly logger = new Logger(BaseController.name);

  protected sendCreateUpdateErrorResponse(res: Response, err: Error): void {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).send(
        ApiError.format({
          code: 400,
          cause: err.message,
        }),
      );
    } else if (err.message.includes('required')) {
      const apiError = this.validateTransactionParamError(err);
      res.status(apiError.code).send(ApiError.format(apiError));
    } else {
      this.logger.error(err);
      res.status(500).send(
        ApiError.format({
          code: 500,
          cause: 'Something went wrong!',
        }),
      );
    }
  }

  private validateTransactionParamError(err: Error): APIError {
    if (err.message === `Currency 'to' converter is required`) {
      return {
        code: 400,
        cause: `Valid currency 'to' converter is required`,
        message: `You need to provide a valid Valid 'currency ISO code' in to param.`,
      };
    }
    if (err.message === `'Amount' to converter is required`) {
      return {
        code: 400,
        cause: `Valid 'amount' to converter is required`,
        message: `You must provide a valid 'amount' in numeric format and Number type for the conversion.`,
      };
    }
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
