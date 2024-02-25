import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { RedisService } from 'src/redis/redis.service';
import {
  CAPTCHA_END_INDEX,
  CAPTCHA_EXPIRE_TIME,
  CAPTCHA_KEY,
  CAPTCHA_START_INDEX,
} from 'src/constants/captcha';
import { Public } from 'src/decorator/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags(' 验证码模块')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @ApiOperation({ summary: '获取注册验证码' })
  @Public()
  @Get('email/register')
  async getRegisterCaptcha(@Query('to') to: string) {
    const captchaKey = `${CAPTCHA_KEY.user_register}${to}`;
    const code = Math.random()
      .toString()
      .slice(CAPTCHA_START_INDEX, CAPTCHA_END_INDEX);

    await this.redisService.del(captchaKey);
    await this.redisService.set(captchaKey, code, CAPTCHA_EXPIRE_TIME);

    await this.captchaService.sendEmailCaptcha({
      to: to,
      subject: '注册验证码',
      html: `<p>你的验证码是: ${code}</p>`,
    });

    return '发送成功';
  }

  @ApiOperation({ summary: '获取修改密码验证码' })
  @Get('email/password/update')
  async getUpdatePasswordCaptcha(@Query('to') to: string) {
    const captchaKey = `${CAPTCHA_KEY.update_password}${to}`;
    const code = Math.random()
      .toString()
      .slice(CAPTCHA_START_INDEX, CAPTCHA_END_INDEX);

    await this.redisService.del(captchaKey);
    await this.redisService.set(captchaKey, code, CAPTCHA_EXPIRE_TIME);

    await this.captchaService.sendEmailCaptcha({
      to: to,
      subject: '修改密码',
      html: `<p>你的验证码是: ${code}</p>`,
    });

    return '发送成功';
  }
}
