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
import { UpdateEquipmentInfoDto } from './dto/update-equipment.dto';
import { Permission } from 'src/decorator/permission.decorator';
import { DeleteEquipmentDto } from './dto/delete-equipment.dto';

@ApiTags('设备模块')
@Public()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @ApiOperation({ summary: '创建设备' })
  @Permission('admin')
  @Post('create')
  createEquipment(@Body() equipmentDto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(equipmentDto);
  }

  @ApiOperation({ summary: '更新设备信息' })
  @Post('update')
  @Permission('admin')
  updateEquipmentInfo(@Body() equipmentInfoDto: UpdateEquipmentInfoDto) {
    return this.equipmentService.updateEquipmentInfo(equipmentInfoDto);
  }

  @ApiOperation({ summary: '删除设备 (id)' })
  @Post('delete')
  @Permission('admin')
  deleteEquipment(@Body() deleteEquipmentDto: DeleteEquipmentDto) {
    return this.equipmentService.deleteEquipment(deleteEquipmentDto.id);
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
