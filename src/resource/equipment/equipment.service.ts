import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import { EQUIPMENT_PRI_VALUE_EXIST } from 'src/constants/error/equipment';
import to from 'src/utils/to';
import { COMMON_ERR } from 'src/constants/error/common';

@Injectable()
export class EquipmentService {
  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>;

  async createEquipment(equipmentDto: CreateEquipmentDto): Promise<any> {
    const existCount = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.name = :name OR equipment.code = :code', {
        name: equipmentDto.name,
        code: equipmentDto.code,
      })
      .getCount();

    if (existCount != 0) {
      throw new ErrorException(
        EQUIPMENT_PRI_VALUE_EXIST,
        '设备 name 或者 code 值已存在',
      );
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
}
