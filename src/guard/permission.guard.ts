import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter'
import { PERMISSION_MISSING } from 'src/constants/error/user'
import { PERMISSION_KEY } from 'src/decorator/permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    if (!request.user) {
      // 当不存在 user 信息时, 说明为公共接口, 不需要权限判断
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getClass(), context.getHandler()],
    )

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const userPermissions = request.user.permissions

    for (let i = 0; i < requiredPermissions.length; i++) {
      const curRequiredPermission = requiredPermissions[i]
      const match = userPermissions.find(
        (p) => p.code === curRequiredPermission,
      )
      if (!match) {
        throw new ErrorException(
          PERMISSION_MISSING,
          '权限缺失',
          HttpStatus.FORBIDDEN,
        )
      }
    }

    return true
  }
}
