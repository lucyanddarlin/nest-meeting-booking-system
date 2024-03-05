import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateBookingDto {
  @IsNotEmpty({ message: 'meeting_room_id cannot be empty' })
  meetingRoomId: string

  @IsNotEmpty({ message: 'meeting_start_time cannot be empty' })
  @IsInt({ message: 'meeting_start_time should be passed as INT' })
  startTime: number

  @IsNotEmpty({ message: 'meeting_end_time cannot be empty' })
  @IsInt({ message: 'meeting_end_time should be passed as INT' })
  endTime: number

  @IsNotEmpty({ message: 'user_ids cannot be empty' })
  @IsArray({ message: 'user_ids should be passed as array' })
  userIds: number[]

  @IsOptional()
  note?: string
}
