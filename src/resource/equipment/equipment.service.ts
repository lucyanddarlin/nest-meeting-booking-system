import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Equipment } from './entities/equipment.entity'
import { Repository } from 'typeorm'
import { CreateEquipmentDto } from './dto/create-equipment.dto'
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter'
import to from 'src/utils/to'
import { COMMON_ERR } from 'src/constants/error/common'
import {
  EQUIPMENT_CODE_EXIST,
  EQUIPMENT_NAME_EXIST,
  EQUIPMENT_NOT_EXIST,
} from 'src/constants/error/equipment'
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate'
import { getPaginationOptions } from 'src/utils/paginate'
import { EquipmentListVo } from './vo/equipment-list.vo'
import { UpdateEquipmentInfoDto } from './dto/update-equipment.dto'
import { checkExist } from 'src/utils/checkExist'

@Injectable()
export class EquipmentService {
  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>

  /**
   * 检查是否有重复的设备 (name code)
   * @param name
   * @param code
   */
  private async _checkExistEquipment(
    name: string,
    code: string,
  ): Promise<ErrorException | null> {
    return checkExist(this.equipmentRepository)(
      'equipment',
      'equipment.name = :name OR equipment.code = :code',
      {
        name,
        code,
      },
      (existEquipments) => {
        const existName = existEquipments.find((e) => e.name === name)
        const existCode = existEquipments.find((e) => e.code === code)

        if (existName) {
          return new ErrorException(EQUIPMENT_NAME_EXIST, '设备名称已存在')
        }

        if (existCode) {
          return new ErrorException(EQUIPMENT_CODE_EXIST, '设备 code 已存在')
        }

        return null
      },
    )
  }

  private async checkExistEquipmentById(
    id: number | string,
  ): Promise<ErrorException | null> {
    return await checkExist(this.equipmentRepository)(
      'equipment',
      'equipment.id = :id',
      { id },
      (equipments) => {
        if (equipments.length === 0) {
          return new ErrorException(EQUIPMENT_NOT_EXIST, '设备不存在')
        }
        return null
      },
    )
  }

  /**
   * 创建设备
   * @param equipmentDto
   */
  async createEquipment(equipmentDto: CreateEquipmentDto): Promise<string> {
    const existErr = await this._checkExistEquipment(
      equipmentDto.name,
      equipmentDto.code,
    )

    if (existErr) {
      throw existErr
    }

    const nextEquipment = new Equipment()
    nextEquipment.name = equipmentDto.name
    nextEquipment.code = equipmentDto.code

    const [err] = await to(this.equipmentRepository.insert(nextEquipment))

    if (err) {
      throw new ErrorException(COMMON_ERR, '设备创建异常: ' + err.message)
    }

    return '创建成功'
  }

  /**
   * 修改设备基础信息
   * @param equipmentBaseDto
   */
  async updateEquipmentInfo(equipmentBaseDto: UpdateEquipmentInfoDto) {
    const notExistIdErr = await this.checkExistEquipmentById(
      equipmentBaseDto.id,
    )

    if (notExistIdErr) {
      throw notExistIdErr
    }

    const existErr = await this._checkExistEquipment(
      equipmentBaseDto.name,
      equipmentBaseDto.code,
    )
    if (existErr) {
      throw existErr
    }

    try {
      await this.equipmentRepository.update(
        equipmentBaseDto.id,
        equipmentBaseDto,
      )
      return '修改成功'
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '修改异常: ' + error.message)
    }
  }

  /**
   * 根据 id 获取设备
   * @param id
   * @returns
   */
  async getEquipmentById(id: number): Promise<Equipment> {
    const existEquipment = await this.equipmentRepository.findOne({
      where: { id },
    })

    if (!existEquipment) {
      throw new ErrorException(EQUIPMENT_NOT_EXIST, '设备不存在')
    }

    return existEquipment
  }

  /**
   * 根据 ids 批量获取设备
   * @param ids
   */
  async getEquipmentByIds(ids: Array<string | number>): Promise<Equipment[]> {
    const uIds = [...new Set(ids)].map((id) => +id)

    const equipments = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.id IN (:...values)', { values: uIds })
      .getMany()

    if (equipments.length === 0) {
      throw new ErrorException(EQUIPMENT_NOT_EXIST, '设备不存在')
    }

    return equipments
  }

  /**
   * 删除设备 (id)
   * @param id
   */
  async deleteEquipment(id: number | string) {
    const notExistIdErr = await this.checkExistEquipmentById(id)

    if (notExistIdErr) {
      throw notExistIdErr
    }

    try {
      await this.equipmentRepository.delete(id)
      return '删除成功'
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '删除异常: ' + error.message)
    }
  }

  /**
   * 设备列表分页
   * @param page
   * @param limit
   */
  async paginate(
    page: number,
    limit: number,
    name?: string,
    code?: string,
  ): Promise<EquipmentListVo> {
    const queryBuilder =
      this.equipmentRepository.createQueryBuilder('equipment')
    queryBuilder.leftJoinAndSelect('equipment.meetings', 'meetings')

    if (name) {
      queryBuilder.andWhere('equipment.name LIKE :name', { name: `%${name}%` })
    }

    if (code) {
      queryBuilder.andWhere('equipment.code LIKE :code', { code: `%${code}%` })
    }

    const [paginate] = await paginateRawAndEntities(
      queryBuilder,
      getPaginationOptions(page, limit),
    )

    return { list: paginate.items, meta: paginate.meta }
  }
}
