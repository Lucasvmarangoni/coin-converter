import { HttpStatus } from '@nestjs/common';

export interface APIError {
  code: number;
  cause: string;
  message?: string;
  codeAsString?: string;
  description?: string;
  documentation?: string;
}

export interface APIErrorResponse extends Omit<APIError, 'codeAsString'> {
  error: string;
}

export default class ApiError {
  public static format(error: APIError): APIErrorResponse {
    return {
      ...{},
      ...{
        code: error.code,
        error: error.codeAsString ? error.codeAsString : HttpStatus[error.code],
        cause: error.cause,
      },
      ...(error.message && { message: error.message }),
      ...(error.documentation && { documentation: error.documentation }),
      ...(error.description && { description: error.description }),
    };
  }
}
