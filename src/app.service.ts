import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  @Inject(ConfigService)
  private configService: ConfigService

  getHealthCheck(): string {
    return `${this.configService.get('nest_server_name')} is running on ${this.configService.get('nest_server_port')}`
  }
}
