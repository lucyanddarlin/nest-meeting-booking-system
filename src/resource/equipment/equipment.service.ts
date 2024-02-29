import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import to from 'src/utils/to';
import { COMMON_ERR } from 'src/constants/error/common';
import {
  EQUIPMENT_CODE_EXIST,
  EQUIPMENT_NAME_EXIST,
  EQUIPMENT_NOT_EXIST,
} from 'src/constants/error/equipment';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { getPaginationOptions } from 'src/utils/paginate';
import { EquipmentListVo } from './vo/equipment-list.vo';
import { UpdateEquipmentBaseInfoDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>;

  /**
   * 检查是否存在
   * @param key
   * @param cond
   * @param condObj
   * @param transformFunc
   */
  private async _checkExist(
    key: string,
    cond: string,
    condObj: Record<string, any>,
    transformFunc: (equipments: Equipment[]) => ErrorException | null,
  ): Promise<ErrorException | null> {
    const existEquipments = await this.equipmentRepository
      .createQueryBuilder(key)
      .where(cond, condObj)
      .getMany();

    return transformFunc(existEquipments);
  }

  /**
   * 检查是否有重复的设备
   * @param name
   * @param code
   */
  private async _checkExistEquipment(
    name: string,
    code: string,
  ): Promise<ErrorException | null> {
    return this._checkExist(
      'equipment',
      'equipment.name = :name OR equipment.code = :code',
      {
        name,
        code,
      },
      (existEquipments) => {
        const existName = existEquipments.find((e) => e.name === name);
        const existCode = existEquipments.find((e) => e.code === code);

        if (existName) {
          return new ErrorException(EQUIPMENT_NAME_EXIST, '设备名称已存在');
        }

        if (existCode) {
          return new ErrorException(EQUIPMENT_CODE_EXIST, '设备 code 已存在');
        }

        return null;
      },
    );
  }

  /**
   * 创建设备
   * @param equipmentDto
   */
  async createEquipment(equipmentDto: CreateEquipmentDto): Promise<string> {
    const existErr = await this._checkExistEquipment(
      equipmentDto.name,
      equipmentDto.code,
    );

    if (existErr) {
      throw existErr;
    }

    const nextEquipment = new Equipment();
    nextEquipment.name = equipmentDto.name;
    nextEquipment.code = equipmentDto.code;

    const [err] = await to(this.equipmentRepository.insert(nextEquipment));

    if (err) {
      throw new ErrorException(COMMON_ERR, '设备创建异常: ' + err.message);
    }

    return '创建成功';
  }

  /**
   * 修改设备基础信息
   * @param equipmentBaseInfoDto
   */
  async updateEquipmentBaseInfo(
    equipmentBaseInfoDto: UpdateEquipmentBaseInfoDto,
  ) {
    const notExistIdErr = await this._checkExist(
      'equipment',
      'equipment.id = :id',
      { id: equipmentBaseInfoDto.id },
      (equipments) => {
        if (equipments.length === 0) {
          return new ErrorException(EQUIPMENT_NOT_EXIST, '设备不存在');
        }
        return null;
      },
    );

    if (notExistIdErr) {
      throw notExistIdErr;
    }

    const existErr = await this._checkExistEquipment(
      equipmentBaseInfoDto.name,
      equipmentBaseInfoDto.code,
    );
    if (existErr) {
      throw existErr;
    }

    try {
      await this.equipmentRepository.update(
        equipmentBaseInfoDto.id,
        equipmentBaseInfoDto,
      );
      return '修改成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '修改异常: ' + error.message);
    }
  }

  /**
   * 设备列表分页
   * @param page
   * @param limit
   */
  async paginate(page: number, limit: number): Promise<EquipmentListVo> {
    const queryBuilder =
      this.equipmentRepository.createQueryBuilder('equipment');
    queryBuilder.leftJoinAndSelect('equipment.meetings', 'meetings');

    const [paginate] = await paginateRawAndEntities(
      queryBuilder,
      getPaginationOptions(page, limit),
    );

    return { list: paginate.items, meta: paginate.meta };
  }
}
