import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Response, Request } from 'express'
import { ErrorObj } from './base.exceptions.filter'
import { getReqMainInfo } from 'src/utils/request-info'

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger

  /**
   * 转换错误信息
   */
  private convertErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error
    } else if (typeof error === 'object') {
      if (Array.isArray(error.message)) {
        return error.message[0]
      }
      return error.message || ''
    }

    return ''
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request: Request = ctx.getRequest()
    const response: Response = ctx.getResponse()
    const status = exception.getStatus()
    const exceptionRes: any = exception.getResponse()

    const errObj: ErrorObj = {
      data: null,
      code: exceptionRes.code ?? status,
      message: this.convertErrorMessage(exceptionRes),
    }

    this.logger.error('http-error', {
      meta: {
        extra: { ...errObj },
        req: { ...getReqMainInfo(request) },
      },
    })

    response.status(status).json(errObj)
  }
}
