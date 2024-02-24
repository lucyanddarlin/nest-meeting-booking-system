import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import {
  CAPTCHA_INCORRECT,
  CAPTCHA_NOT_EXIST,
  USER_EXIST,
} from 'src/constants/error/user';
import { md5 } from 'src/utils/md5';
import to from 'src/utils/to';
import { COMMON_ERR } from 'src/constants/error/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(AuthService)
  private readonly authService: AuthService;

  /**
   * 注册用户
   * @param user
   */
  async register(user: CreateUserDto): Promise<string> {
    const captchaKey = `captcha_${user.email}`;
    const captcha = await this.redisService.get(captchaKey);

    if (!captcha) {
      throw new ErrorException(CAPTCHA_NOT_EXIST, '验证码不存在或已过期');
    }

    if (user.captcha !== captcha) {
      throw new ErrorException(CAPTCHA_INCORRECT, '验证码错误');
    }

    const existUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (existUser) {
      throw new ErrorException(USER_EXIST, '用户已存在');
    }

    const hashPwd = await this.authService.hashPassword(user.password);

    const nextUser = new User();
    nextUser.username = user.username;
    nextUser.nickName = user.nickname;
    nextUser.password = hashPwd;
    nextUser.email = user.email;

    const [err] = await to(this.userRepository.save(nextUser));
    if (err) {
      this.logger.error(JSON.stringify(err));
      throw new ErrorException(COMMON_ERR, JSON.stringify(err));
    }

    await this.redisService.del(captchaKey);

    return '注册成功';
  }
}
