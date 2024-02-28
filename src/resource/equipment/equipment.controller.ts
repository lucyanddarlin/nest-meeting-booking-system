import { Body, Controller, Post } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { Public } from 'src/decorator/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('设备模块')
@Public()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @ApiOperation({ summary: '创建设备' })
  @Post('create')
  createEquipment(@Body() equipmentDto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(equipmentDto);
  }
}
