import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response } from 'express';

export interface ErrorObj {
  data: null;
  code: string | number;
  message: string;
}

@Catch()
export class BaseExceptionsFilter implements ExceptionFilter {
  private logger = new Logger();
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    // TODO: 调整 logger
    this.logger.error(
      exception.message ?? new ServiceUnavailableException().getResponse(),
    );

    const errObj: ErrorObj = {
      data: null,
      code: HttpStatus.SERVICE_UNAVAILABLE,
      message:
        exception.message ??
        new ServiceUnavailableException().getResponse()['message'],
    };

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json(errObj);
  }
}
