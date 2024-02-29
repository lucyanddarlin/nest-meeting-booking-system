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
} from 'src/constants/error/equipment';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { getPaginationOptions } from 'src/utils/paginate';
import { EquipmentListVo } from './vo/equipment-list.vo';

@Injectable()
export class EquipmentService {
  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>;

  /**
   * 创建设备
   * @param equipmentDto
   */
  async createEquipment(equipmentDto: CreateEquipmentDto): Promise<string> {
    const existEquipments = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.name = :name OR equipment.code = :code', {
        name: equipmentDto.name,
        code: equipmentDto.code,
      })
      .getMany();

    const existName = existEquipments.find((e) => e.name === equipmentDto.name);
    const existCode = existEquipments.find((e) => e.code === equipmentDto.code);

    if (existName) {
      throw new ErrorException(EQUIPMENT_NAME_EXIST, '设备名称已存在');
    }

    if (existCode) {
      throw new ErrorException(EQUIPMENT_CODE_EXIST, '设备 code 已存在');
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
