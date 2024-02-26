import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getReqMainInfo } from 'src/utils/request-info';

export interface ErrorObj {
  data: null;
  code: string | number;
  message: string;
}

@Catch()
export class BaseExceptionsFilter implements ExceptionFilter {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    const errObj: ErrorObj = {
      data: null,
      code: HttpStatus.SERVICE_UNAVAILABLE,
      message:
        exception.message ??
        new ServiceUnavailableException().getResponse()['message'],
    };

    this.logger.error('base-error', {
      meta: {
        extra: { ...errObj },
        req: { ...getReqMainInfo(request) },
      },
    });

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json(errObj);
  }
}
