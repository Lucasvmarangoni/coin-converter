import { HttpException, HttpStatus } from '@nestjs/common';

export class ExchangeratesInvalidInputError extends HttpException {
  constructor(message: string) {
    const internalMessage = message;
    super(internalMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
