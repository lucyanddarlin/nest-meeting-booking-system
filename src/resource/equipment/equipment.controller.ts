import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { Public } from 'src/decorator/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { defaultPaginationParams } from 'src/constants/paginate';

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

  @ApiOperation({ summary: '设备列表分页' })
  @Get('list')
  getEquipmentList(
    @Query(
      'page',
      new DefaultValuePipe(defaultPaginationParams.currentPage),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(defaultPaginationParams.pageSize),
      ParseIntPipe,
    )
    limit: number,
  ) {
    return this.equipmentService.paginate(page, limit);
  }
}
