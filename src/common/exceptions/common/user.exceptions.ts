import { USER_NOT_EXIST } from 'src/constants/error/user';
import { ErrorException } from '../error.exceptions.filter';
import { HttpStatus } from '@nestjs/common';

export class UserNotExistError extends ErrorException {
  constructor(code?: string | number, msg?: string, status?: HttpStatus) {
    super(
      code ?? USER_NOT_EXIST,
      msg ?? '用户不存在',
      status ?? HttpStatus.BAD_REQUEST,
    );
  }
}
