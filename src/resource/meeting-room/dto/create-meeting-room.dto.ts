import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateMeetingRoomDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_name cannot be empty' })
  name: string;

  @ApiProperty()
  @IsInt({ message: 'meeting_capacity should be passed as INT' })
  @IsNotEmpty({ message: 'meeting_capacity cannot be empty' })
  capacity: number;

  @ApiProperty()
  @IsArray({ message: 'equipment should passed as array' })
  @IsNotEmpty({ message: 'meeting_equipment_ids cannot be empty' })
  equipmentsIds: Array<string | number>;

  @ApiProperty()
  @IsNotEmpty({ message: 'meeting_location_id cannot be empty' })
  locationId: string | number;
}
