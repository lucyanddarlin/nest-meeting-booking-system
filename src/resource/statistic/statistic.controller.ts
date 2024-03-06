import { Controller, Get, Query } from '@nestjs/common'
import { StatisticService } from './statistic.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('统计模块')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiOperation({ summary: '用户预订统计' })
  @Get('count/user/booking')
  getUserBookingCount(
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
  ) {
    return this.statisticService.userBookingCount(+startTime, +endTime)
  }

  @ApiOperation({ summary: '会议预订统计' })
  @Get('count/meeting/booking')
  getMeetingBookingCount(
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
  ) {
    return this.statisticService.meetingBookingCount(+startTime, +endTime)
  }
}
