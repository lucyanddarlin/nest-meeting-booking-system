import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export default class DeleteLocationDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'location_id cannot be empty' })
  id: number
}
