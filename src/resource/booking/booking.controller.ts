import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/decorator/public.decorator'
import { defaultPaginationParams } from 'src/constants/paginate'

@ApiTags('预订模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
  ) {
    return this.bookingService.paginate(
      page,
      limit,
      username,
      meetingRoom,
      location,
    )
  }

  @ApiOperation({ summary: '开发环境初始化数据' })
  @Public()
  @Get('dev-init')
  initDev() {
    return this.bookingService.initDevData()
  }
}
