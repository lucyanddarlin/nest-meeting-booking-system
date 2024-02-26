import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, map } from 'rxjs';
import { Logger } from 'winston';
import { Request } from 'express';
import { getReqMainInfo } from 'src/utils/request-info';

export interface BaseResponse<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  constructor() {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T>> | Promise<Observable<BaseResponse<T>>> {
    const req: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        this.logger.info('response', { resData: data, ...getReqMainInfo(req) });
        return {
          data: data ?? '',
          code: 200,
          message: '',
        };
      }),
    );
  }
}
