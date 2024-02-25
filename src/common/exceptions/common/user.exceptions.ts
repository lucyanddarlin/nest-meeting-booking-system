import {
  USER_NOT_EXIST,
  USER_PASSWORD_INCORRECT,
} from 'src/constants/error/user';
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

export class UserPasswordInCorrect extends ErrorException {
  constructor(code?: string | number, msg?: string, status?: HttpStatus) {
    super(
      code ?? USER_PASSWORD_INCORRECT,
      msg ?? '用户密码错误',
      status ?? HttpStatus.BAD_REQUEST,
    );
  }
}
