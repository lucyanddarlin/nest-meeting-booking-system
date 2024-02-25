import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SALT_ROUND } from 'src/constants/auth';
import { PayLoad } from 'src/user/dto/login-user.dto';

@Injectable()
export class AuthService {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  /**
   * 加密密码
   * @param pwd
   */
  async hashPassword(pwd: string): Promise<string> {
    return await bcrypt.hash(pwd, SALT_ROUND);
  }

  /**
   * 验证密码
   */
  async verifyPassword(pwd: string, hasPwd: string): Promise<boolean> {
    return await bcrypt.compare(pwd, hasPwd);
  }

  /**
   * 生成 access token
   */
  generateAccessToken(payLoad: PayLoad): string {
    const accessToken = this.jwtService.sign(
      {
        id: payLoad.id,
        username: payLoad.username,
        roles: payLoad.roles,
        permissions: payLoad.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_exp') ?? '30m',
      },
    );

    return accessToken;
  }

  /**
   * 生成 refresh token
   * @param payLoad
   */
  generateRefreshToken(payLoad: PayLoad): string {
    const refreshToken = this.jwtService.sign(
      {
        id: payLoad.id,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_exp') ?? '5d',
      },
    );

    return refreshToken;
  }
}
