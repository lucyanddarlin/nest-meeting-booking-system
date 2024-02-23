import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { RedisService } from 'src/redis/redis.service';
import { CAPTCHA_EXPIRE_TIME } from 'src/constants/captcha';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Get('email')
  async getEmailCaptcha(@Query('address') address: string) {
    const captchaKey = `captcha_${address}`;
    const code = Math.random().toString().slice(2, 8);

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
