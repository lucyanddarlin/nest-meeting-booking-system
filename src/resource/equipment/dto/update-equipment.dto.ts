import { PartialType } from '@nestjs/swagger';
import { CreateEquipmentDto } from './create-equipment.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateEquipmentBaseInfoDto extends PartialType(
  CreateEquipmentDto,
) {
  @IsNotEmpty({ message: "equipment'id cannot be empty" })
  id: number;
}
