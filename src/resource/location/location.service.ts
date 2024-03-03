import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import { COMMON_ERR } from 'src/constants/error/common';
import { checkExist } from 'src/utils/checkExist';
import {
  LOCATION_CODE_EXIST,
  LOCATION_NAME_EXIST,
  LOCATION_NOT_EXIST,
} from 'src/constants/error/location';
import to from 'src/utils/to';
import DeleteLocationDto from './dto/delete-location.dto';
import LocationListVo from './vo/location-list.vo';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { getPaginationOptions } from 'src/utils/paginate';

@Injectable()
export class LocationService {
  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  /**
   * 检查地点是否存在 (name code)
   * @param name
   * @param code
   */
  private async checkExistLocationByInfo(name: string, code: string) {
    return await checkExist(this.locationRepository)(
      'location',
      'location.name = :name OR location.code = :code',
      {
        name,
        code,
      },
      (locations) => {
        const existName = locations.find((l) => l.name === name);
        const existCode = locations.find((l) => l.code === code);

        if (existName) {
          return new ErrorException(LOCATION_NAME_EXIST, '地点名称已存在');
        } else if (existCode) {
          return new ErrorException(LOCATION_CODE_EXIST, '地点 code 已存在');
        }
        return null;
      },
    );
  }

  /**
   * 检查地点是否存在 (id)
   * @param id
   */
  private async checkExistLocationById(id: number | string) {
    return await checkExist(this.locationRepository)(
      'location',
      'location.id = :id',
      { id },
      (locations) => {
        if (locations.length === 0) {
          return new ErrorException(LOCATION_NOT_EXIST, '地点不存在');
        }
        return null;
      },
    );
  }

  /**
   * 创建地点
   * @param createLocationDto
   */
  async createLocation(createLocationDto: CreateLocationDto): Promise<any> {
    const existErr = await this.checkExistLocationByInfo(
      createLocationDto.name,
      createLocationDto.code,
    );

    if (existErr) {
      throw existErr;
    }

    const location = new Location();
    location.name = createLocationDto.name;
    location.code = createLocationDto.code;

    const [err] = await to(this.locationRepository.insert(location));
    if (err) {
      throw new ErrorException(
        COMMON_ERR,
        '创建 location 异常: ' + err.message,
      );
    }

    return '创建成功';
  }

  /**
   * 修改地点信息
   * @param updateLocationDto
   * @returns
   */
  async updateLocationInfo(updateLocationDto: UpdateLocationDto): Promise<any> {
    const notExistErr = await this.checkExistLocationById(updateLocationDto.id);
    if (notExistErr) {
      throw notExistErr;
    }

    const existErr = await this.checkExistLocationByInfo(
      updateLocationDto.name,
      updateLocationDto.code,
    );
    if (existErr) {
      throw existErr;
    }

    try {
      await this.locationRepository.update(
        updateLocationDto.id,
        updateLocationDto,
      );
      return '更新成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '更新地点异常: ' + error.message);
    }
  }

  /**
   * 删除地点
   * @param deleteLocationDto
   */
  async deleteLocation(deleteLocationDto: DeleteLocationDto): Promise<any> {
    const notExistErr = await this.checkExistLocationById(deleteLocationDto.id);
    if (notExistErr) {
      throw notExistErr;
    }

    try {
      await this.locationRepository.delete(deleteLocationDto.id);
      return '删除成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '删除异常: ' + error.message);
    }
  }

  /**
   * 地点列表分页
   * @param page
   * @param limit
   */
  async paginate(page: number, limit: number): Promise<LocationListVo> {
    const query = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.meeting', 'meeting');

    const [{ items, meta }] = await paginateRawAndEntities(
      query,
      getPaginationOptions(page, limit),
    );

    return { list: items, meta };
  }
}
