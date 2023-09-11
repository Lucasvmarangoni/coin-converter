import { HttpException, HttpStatus } from '@nestjs/common';

export class ExchangeratesResponseError extends HttpException {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the Exchangerates service';
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: internalMessage,
        error: message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
