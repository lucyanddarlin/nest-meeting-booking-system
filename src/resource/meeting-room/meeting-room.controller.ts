import {
  Controller,
  Get,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Post,
  Param,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomInfoDto } from './dto/update-meeting-room-info.dto';
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

  @ApiOperation({ summary: '修改会议室信息' })
  @Post('info/update')
  updateMeetingRoomInfo(@Body() meetingRoomInfoDto: UpdateMeetingRoomInfoDto) {
    return this.meetingService.updateMeetingRoomInfo(meetingRoomInfoDto);
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

  @ApiOperation({ summary: '根据 id 获取会议室' })
  @Get(':id')
  getMeetingRoomById(@Param('id') id: string) {
    return this.meetingService.getMeetingRoomById(+id);
  }

  @ApiOperation({ summary: '开发环境初始化数据' })
  @Public()
  @Get('dev-init')
  initDevData() {
    return this.meetingService.initData();
  }
}
