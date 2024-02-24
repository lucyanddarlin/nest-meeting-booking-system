import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SALT_ROUND } from 'src/constants/auth';

@Injectable()
export class AuthService {
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
}
