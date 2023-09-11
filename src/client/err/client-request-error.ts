import { HttpException, HttpStatus } from '@nestjs/common';

export class ClientRequestError extends HttpException {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate with Exchangerates';
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `${internalMessage}: ${message}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
