import { CustomPaginationMeta } from 'src/utils/paginate'
import { Location } from '../entities/location.entity'
import { ApiProperty } from '@nestjs/swagger'

export default class LocationListVo {
  @ApiProperty({ type: [Location] })
  list: Location[]

  @ApiProperty()
  meta: CustomPaginationMeta
}
