import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
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

  @ApiOperation({ summary: '根据 ids 批量获取设备' })
  @Get('many')
  getEquipmentByIds(@Query('ids') ids: string) {
    const idsArr = ids.split(',');
    return this.equipmentService.getEquipmentByIds(idsArr);
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
    @Query('name') name: string,
    @Query('code') code: string,
  ) {
    return this.equipmentService.paginate(page, limit, name, code);
  }

  @ApiOperation({ summary: '根据 id 获取设备' })
  @Get(':id')
  getEquipmentById(@Param('id') id: string) {
    return this.equipmentService.getEquipmentById(+id);
  }
}
