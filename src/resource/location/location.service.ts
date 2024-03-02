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
    const existErr = this.checkExistLocationByInfo(
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
      return notExistErr;
    }

    const existErr = await this.checkExistLocationByInfo(
      updateLocationDto.name,
      updateLocationDto.code,
    );
    if (existErr) {
      return existErr;
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
   * 删除定位
   * @param deleteLocationDto
   */
  async deleteLocation(deleteLocationDto: DeleteLocationDto): Promise<any> {
    const notExistErr = await this.checkExistLocationById(deleteLocationDto.id);
    if (notExistErr) {
      return notExistErr;
    }

    try {
      await this.locationRepository.delete(deleteLocationDto.id);
      return '删除成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '删除异常: ' + error.message);
    }
  }
}
