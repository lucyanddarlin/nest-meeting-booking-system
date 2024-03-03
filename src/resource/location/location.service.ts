import { Inject, Injectable, forwardRef } from '@nestjs/common';
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
import LocationListVo from './vo/location-list.vo';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { getPaginationOptions } from 'src/utils/paginate';
import { MeetingRoomService } from '../meeting-room/meeting-room.service';

@Injectable()
export class LocationService {
  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  @Inject(forwardRef(() => MeetingRoomService))
  private readonly meetingRoomService: MeetingRoomService;

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
  async deleteLocation(id: number): Promise<any> {
    const location = await this.getLocationById(id);
    let mRoom;
    if (location.isUsed) {
      mRoom = await this.meetingRoomService.getMeetingRoomById(
        location.meeting.id,
      );
    }

    const connect = this.locationRepository.manager.connection;

    try {
      return await connect.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.remove([location, mRoom]);

        return '删除成功';
      });
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '删除异常: ' + error.message);
    }
  }

  /**
   * 根据 id 获取地点
   * @param id
   */
  async getLocationById(id: number): Promise<Location> {
    const existLocation = await this.locationRepository.findOne({
      where: { id },
      relations: { meeting: true },
    });
    if (!existLocation) {
      throw new ErrorException(LOCATION_NOT_EXIST, '地点不存在');
    }

    return existLocation;
  }

  /**
   * 地点列表分页
   * @param page
   * @param limit
   */
  async paginate(
    page: number,
    limit: number,
    name?: string,
    code?: string,
  ): Promise<LocationListVo> {
    const query = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.meeting', 'meeting');

    if (name) {
      query.where('location.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      query.where('location.code LIKE :code', { code: `%${code}%` });
    }

    const [{ items, meta }] = await paginateRawAndEntities(
      query,
      getPaginationOptions(page, limit),
    );

    return { list: items, meta };
  }
}
