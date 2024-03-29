import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common'
import { LocationService } from './location.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { defaultPaginationParams } from 'src/constants/paginate'

@ApiTags('地点模块')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: '创建地点' })
  @Post('create')
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.createLocation(createLocationDto)
  }

  @ApiOperation({ summary: '更新地点信息' })
  @Post('update')
  updateLocation(@Body() updateLOcation: UpdateLocationDto) {
    return this.locationService.updateLocationInfo(updateLOcation)
  }

  @ApiOperation({ summary: '删除地点' })
  @Delete(':id')
  deleteLocation(@Param('id') id: string) {
    return this.locationService.deleteLocation(+id)
  }

  @ApiOperation({ summary: '地点列表分页' })
  @Get('list')
  paginate(
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
    return this.locationService.paginate(page, limit, name, code)
  }

  @ApiOperation({ summary: '根据 id 获取地点' })
  @Get(':id')
  getLocationById(@Param('id') id: string) {
    return this.locationService.getLocationById(+id)
  }
}
