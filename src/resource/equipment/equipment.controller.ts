import { Body, Controller, Post } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { Public } from 'src/decorator/public.decorator';

@Public()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post('create')
  createEquipment(@Body() equipmentDto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(equipmentDto);
  }
}
