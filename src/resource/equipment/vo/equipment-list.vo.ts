import { ApiProperty } from '@nestjs/swagger'
import { Equipment } from '../entities/equipment.entity'
import { CustomPaginationMeta } from 'src/utils/paginate'

export class EquipmentListVo {
  @ApiProperty({ type: [Equipment] })
  list: Equipment[]

  @ApiProperty()
  meta: CustomPaginationMeta
}
