import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorObj } from './base.exceptions.filter';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  /**
   * 转换错误信息
   */
  private convertErrorMessage(error: any): string {
    // TODO: 调整 logger
    this.logger.error(error);

    if (typeof error === 'string') {
      return error;
    } else if (typeof error === 'object') {
      return error.message?.join
        ? error.message.join(',')
        : error.message || '';
    }

    return '';
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionRes: any = exception.getResponse();

    const errObj: ErrorObj = {
      data: null,
      code: exceptionRes.code ?? status,
      message: this.convertErrorMessage(exceptionRes),
    };

    response.status(status).json(errObj);
  }
}
