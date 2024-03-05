import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

export const PayloadUser = createParamDecorator(
  (key: string, ctx: ExecutionContext): any => {
    const request: Request = ctx.switchToHttp().getRequest()
    const user = request.user

    if (key) {
      return user[key]
    }
    return user
  },
)
