import {
  Controller,
  Get,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Post,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { defaultPaginationParams } from 'src/constants/paginate';

@ApiTags('会议管理模块')
@Controller('meeting/room')
export class MeetingRoomController {
  constructor(private readonly meetingService: MeetingRoomService) {}

  @ApiOperation({ summary: '创建会议室' })
  @Post('create')
  createMeetingRoom(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingService.createMeetingRoom(createMeetingRoomDto);
  }

  @ApiOperation({ summary: '会议室列表分页' })
  @Get('list')
  getMeetingRoomList(
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
  ) {
    return this.meetingService.paginate(page, limit);
  }

  @ApiOperation({ summary: '开发环境初始化数据' })
  @Public()
  @Get('dev-init')
  initDevData() {
    return this.meetingService.initData();
  }
}
