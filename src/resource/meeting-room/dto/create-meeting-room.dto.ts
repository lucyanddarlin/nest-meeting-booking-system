import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateMeetingRoomDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_name cannot be empty' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_capacity cannot be empty' })
  capacity: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_location cannot be empty' })
  location: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_equipment cannot be empty' })
  @IsArray({ message: 'equipment should passed as array' })
  equipments: Array<string | number>;
}
