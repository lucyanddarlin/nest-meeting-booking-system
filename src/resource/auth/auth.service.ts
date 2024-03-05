import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { SALT_ROUND } from 'src/constants/auth'
import { PayLoad } from 'src/resource/user/dto/login-user.dto'

interface VerifyRefreshTokenResult {
  userId: number
  isAdmin: boolean
}

@Injectable()
export class AuthService {
  @Inject(JwtService)
  private readonly jwtService: JwtService

  @Inject(ConfigService)
  private readonly configService: ConfigService

  /**
   * 加密密码
   * @param pwd
   */
  async hashPassword(pwd: string): Promise<string> {
    return await bcrypt.hash(pwd, SALT_ROUND)
  }

  /**
   * 验证密码
   */
  async verifyPassword(pwd: string, hashPwd: string): Promise<boolean> {
    return await bcrypt.compare(pwd, hashPwd)
  }

  /**
   * 生成 access token
   */
  generateAccessToken(payLoad: PayLoad): string {
    const accessToken = this.jwtService.sign(
      {
        id: payLoad.id,
        isAdmin: payLoad.isAdmin,
        username: payLoad.username,
        roles: payLoad.roles,
        permissions: payLoad.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_exp') ?? '30m',
      },
    )

    return accessToken
  }

  /**
   * 生成 refresh token
   * @param payLoad
   */
  generateRefreshToken(payLoad: PayLoad): string {
    const refreshToken = this.jwtService.sign(
      {
        id: payLoad.id,
        isAdmin: payLoad.isAdmin,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_exp') ?? '5d',
      },
    )

    return refreshToken
  }

  /**
   * 验证 refreshToken
   */
  verifyRefreshToken(refreshToken: string): VerifyRefreshTokenResult {
    const verifyData =
      this.jwtService.verify<VerifyRefreshTokenResult>(refreshToken)

    return verifyData
  }
}
