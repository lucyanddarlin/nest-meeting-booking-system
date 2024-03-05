import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateEquipmentDto } from './create-equipment.dto'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { EquipmentState } from '../entities/equipment.entity'

export class UpdateEquipmentInfoDto extends PartialType(CreateEquipmentDto) {
  @ApiProperty()
  @IsNotEmpty({ message: "equipment'id cannot be empty" })
  id: number

  @ApiProperty()
  @IsEnum(EquipmentState, { message: 'enum is wrong' })
  @IsOptional()
  state: EquipmentState
}
