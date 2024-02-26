import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_KEY } from 'src/decorator/public.decorator';
import { PayLoad } from 'src/resource/user/dto/login-user.dto';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import {
  TOKEN_INCORRECT_FORMAT,
  TOKEN_MISSING,
  TOKEN_VERIFY_FAIL,
} from 'src/constants/error/user';
import to from 'src/utils/to';

declare module 'express' {
  interface Request {
    user: PayLoad;
  }
}

const AUTHORIZATION_KEY = 'Bearer';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new ErrorException(
        TOKEN_MISSING,
        'token 缺失',
        HttpStatus.FORBIDDEN,
      );
    }

    const authorizationStr = request.headers.authorization.split(' ');
    if (
      authorizationStr.length === 0 ||
      authorizationStr.length !== 2 ||
      authorizationStr[0] !== AUTHORIZATION_KEY
    ) {
      throw new ErrorException(
        TOKEN_INCORRECT_FORMAT,
        'token 格式错误',
        HttpStatus.FORBIDDEN,
      );
    }

    const token = authorizationStr[1];

    const [err, payload] = await to<PayLoad>(
      this.jwtService.verifyAsync(token),
    );

    if (err) {
      throw new ErrorException(
        TOKEN_VERIFY_FAIL,
        'token 验证失败: ' + err,
        HttpStatus.FORBIDDEN,
      );
    }

    request.user = payload;

    return true;
  }
}
