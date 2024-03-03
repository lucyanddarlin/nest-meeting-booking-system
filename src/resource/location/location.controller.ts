import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { defaultPaginationParams } from 'src/constants/paginate';

@ApiTags('地点模块')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: '创建地点' })
  @Post('create')
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.createLocation(createLocationDto);
  }

  @ApiOperation({ summary: '更新地点信息' })
  @Post('update')
  updateLocation(@Body() updateLOcation: UpdateLocationDto) {
    return this.locationService.updateLocationInfo(updateLOcation);
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
  ) {
    return this.locationService.paginate(page, limit);
  }
}
