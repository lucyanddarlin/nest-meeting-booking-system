import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'

@Injectable()
export class CaptchaService {
  private readonly transporter: Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('node_emailer_host'),
      port: this.configService.get('node_emailer_port'),
      secure: false,
      auth: {
        user: this.configService.get('node_emailer_auth_user'),
        pass: this.configService.get('node_emailer_auth_pass'),
      },
    })
  }

  async sendEmailCaptcha({
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: this.configService.get('node_emailer_auth_user'),
      },
      to,
      subject,
      html,
    })
  }
}
