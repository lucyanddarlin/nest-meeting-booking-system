import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorException extends HttpException {
  constructor(code: number | string, message: string) {
    super({ code, message }, HttpStatus.OK);
  }
}
