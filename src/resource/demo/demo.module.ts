import { Module } from '@nestjs/common'
import { DemoService } from './demo.service'
import { DemoController } from './demo.controller'

// TODO: 即将删除
@Module({
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
