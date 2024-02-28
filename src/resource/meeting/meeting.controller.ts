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
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { defaultPaginationParams } from 'src/constants/paginate';

@ApiTags('会议管理模块')
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @ApiOperation({ summary: '会议室列表分页' })
  @Get('room/list')
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
