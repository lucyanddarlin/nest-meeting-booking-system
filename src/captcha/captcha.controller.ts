import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { RedisService } from 'src/redis/redis.service';
import {
  CAPTCHA_END_INDEX,
  CAPTCHA_EXPIRE_TIME,
  CAPTCHA_START_INDEX,
} from 'src/constants/captcha';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Get('email')
  async getEmailCaptcha(@Query('address') address: string) {
    const captchaKey = `captcha_${address}`;
    const code = Math.random()
      .toString()
      .slice(CAPTCHA_START_INDEX, CAPTCHA_END_INDEX);

    await this.redisService.del(captchaKey);
    await this.redisService.set(captchaKey, code, CAPTCHA_EXPIRE_TIME);

    await this.captchaService.sendEmailCaptcha({
      to: address,
      subject: '注册验证码',
      html: `<p>你的验证码是: ${code}</p>`,
    });

    return 'success';
  }
}
