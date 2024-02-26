import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('会议管理模块')
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}
}
