import { ApiProperty } from '@nestjs/swagger'
import { CustomPaginationMeta } from 'src/utils/paginate'
import { MeetingRoom } from '../entities/meeting-room.entity'

export class MeetingRoomListVo {
  @ApiProperty({ type: [MeetingRoom] })
  list: Array<MeetingRoom>

  @ApiProperty()
  meta: CustomPaginationMeta
}
