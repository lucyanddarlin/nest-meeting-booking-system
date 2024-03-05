import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateEquipmentDto {
  @ApiProperty()
  @IsNotEmpty({ message: "equipment'name cannot be empty" })
  name: string

  @ApiProperty()
  @IsNotEmpty({ message: "equipment's code cannot be empty" })
  code: string

  @ApiProperty()
  @IsInt({ message: 'availableQuantity should be passed like as INT' })
  @IsOptional()
  availableQuantity?: number
}
