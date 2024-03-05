import { HttpException, HttpStatus } from '@nestjs/common'

export class ErrorException extends HttpException {
  constructor(code: number | string, message: string, httpStatus?: HttpStatus) {
    super({ code, message }, httpStatus ?? HttpStatus.OK)
  }
}
