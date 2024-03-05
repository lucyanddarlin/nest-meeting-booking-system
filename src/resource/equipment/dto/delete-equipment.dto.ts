import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class DeleteEquipmentDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'id cannot be empty' })
  id: number | string
}
