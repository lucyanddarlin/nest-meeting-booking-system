import { CustomPaginationMeta } from 'src/utils/paginate'
import { Booking } from '../entities/booking.entity'
import { ApiProperty } from '@nestjs/swagger'

export default class BookingListVo {
  @ApiProperty({ type: [Booking] })
  list: Booking[]

  @ApiProperty()
  meta: CustomPaginationMeta
}
