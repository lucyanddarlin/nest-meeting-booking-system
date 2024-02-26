import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request, Response, NextFunction } from 'express';
import { getReqMainInfo } from 'src/utils/request-info';

@Injectable()
export default class LogMiddleware implements NestMiddleware {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.info('router', {
      req: getReqMainInfo(req),
    });

    next();
  }
}
