import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/decorator/public.decorator'
import { defaultPaginationParams } from 'src/constants/paginate'
import { PayloadUser } from 'src/decorator/userinfo.decorator'
import { PayLoad } from '../user/dto/login-user.dto'
import { BookingState } from './entities/booking.entity'

@ApiTags('预订模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({ summary: '创建预订' })
  @Post('create')
  createMeetingBooking(
    @PayloadUser() payload: PayLoad,
    @Body() bookingDto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(payload, bookingDto)
  }

  @ApiOperation({ summary: '通过预订' })
  @Get('pass/:id')
  passBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.updateBookingState(id, BookingState.Passed)
  }

  @ApiOperation({ summary: '拨回预订' })
  @Get('reject/:id')
  rejectBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.updateBookingState(id, BookingState.Failed)
  }

  @ApiOperation({ summary: '删除预订' })
  @Delete(':id')
  deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.updateBookingState(id, BookingState.IsDeleted)
  }

  @ApiOperation({ summary: '催办预订' })
  @Get('urge/:id')
  urgeBooking(@Param('id') id: number) {
    return this.bookingService.urgeBooking(id)
  }

  @ApiOperation({ summary: '预订列表分页' })
  @Get('list')
  paginate(
    @Query(
      'page',
      new DefaultValuePipe(defaultPaginationParams.currentPage),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(defaultPaginationParams.pageSize),
      ParseIntPipe,
    )
    limit: number,
    @Query('username') username: string,
    @Query('meetingRoom') meetingRoom: string,
    @Query('location') location: string,
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
  ) {
    return this.bookingService.paginate(
      page,
      limit,
      username,
      meetingRoom,
      location,
      +startTime,
      +endTime,
    )
  }

  @ApiOperation({ summary: '开发环境初始化数据' })
  @Public()
  @Get('dev-init')
  initDev() {
    return this.bookingService.initDevData()
  }
}
