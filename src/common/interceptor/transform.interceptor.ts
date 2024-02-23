import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface BaseResponse<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T>> | Promise<Observable<BaseResponse<T>>> {
    return next.handle().pipe(
      map((data) => ({
        data: data ?? '',
        code: 200,
        message: '',
      })),
    );
  }
}
