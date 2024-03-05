import { PartialType } from '@nestjs/swagger'
import { CreateMeetingRoomDto } from './create-meeting-room.dto'
import { IsNotEmpty } from 'class-validator'

export class UpdateMeetingRoomInfoDto extends PartialType(
  CreateMeetingRoomDto,
) {
  @IsNotEmpty({ message: 'meeting_room_id cannot be empty' })
  id: number | string
}
