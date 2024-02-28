import { ApiProperty } from '@nestjs/swagger';
import { CustomPaginationMeta } from 'src/utils/paginate';
import { Meeting } from '../entities/meeting.entity';

export class MeetingListVo {
  @ApiProperty({ type: [Meeting] })
  list: Array<Meeting>;

  @ApiProperty()
  meta: CustomPaginationMeta;
}
