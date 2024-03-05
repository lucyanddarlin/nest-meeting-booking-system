import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MeetingRoom } from './entities/meeting-room.entity'
import { Equipment } from '../equipment/entities/equipment.entity'
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter'
import { COMMON_ERR } from 'src/constants/error/common'
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate'
import { getPaginationOptions } from 'src/utils/paginate'
import { MeetingRoomListVo } from './vo/meeting-room-list.vo'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { Location } from '../location/entities/location.entity'
import { EquipmentService } from '../equipment/equipment.service'
import { LocationService } from '../location/location.service'
import { LOCATION_IS_USED } from 'src/constants/error/location'
import { checkExist } from 'src/utils/checkExist'
import {
  MEETING_ROOM_NAME_EXIST,
  MEETING_ROOM_NOT_EXIST,
} from 'src/constants/error/meeting'
import { UpdateMeetingRoomInfoDto } from './dto/update-meeting-room-info.dto'

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRepository: Repository<MeetingRoom>

  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>

  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>

  @Inject(EquipmentService)
  private readonly equipmentService: EquipmentService

  @Inject(forwardRef(() => LocationService))
  private readonly locationService: LocationService

  /**
   * 检查会议室是否存在 (name)
   * @param name
   */
  private async checkExistMeetingRoom(name: string) {
    return await checkExist(this.meetingRepository)(
      'meeting',
      'meeting.name = :name',
      { name },
      (meetings) => {
        if (meetings.length !== 0) {
          return new ErrorException(MEETING_ROOM_NAME_EXIST, '会议室名称已存在')
        }
        return null
      },
    )
  }

  /**
   * 创建会议室
   * @param meetingDto
   */
  async createMeetingRoom(meetingDto: CreateMeetingRoomDto): Promise<any> {
    const existErr = await this.checkExistMeetingRoom(meetingDto.name)
    if (existErr) {
      throw existErr
    }
    // 获取设备
    const equipments = await this.equipmentService.getEquipmentByIds(
      meetingDto.equipmentsIds,
    )
    // 获取地点
    const location = await this.locationService.getLocationById(
      +meetingDto.locationId,
    )

    if (location.isUsed) {
      throw new ErrorException(LOCATION_IS_USED, '地点已被使用')
    }

    const connection = this.meetingRepository.manager.connection

    try {
      return await connection.transaction(
        async (transactionalEntityManager) => {
          const newMeetingRoom = new MeetingRoom()
          newMeetingRoom.name = meetingDto.name
          newMeetingRoom.capacity = meetingDto.capacity
          newMeetingRoom.equipments = equipments
          newMeetingRoom.location = location

          location.isUsed = true

          await transactionalEntityManager.save(location)
          await transactionalEntityManager.save(newMeetingRoom)

          return '创建成功'
        },
      )
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '创建会议室异常: ' + error.message)
    }
  }

  /**
   * 根据 id 获取会议室
   * @param id
   */
  async getMeetingRoomById(id: number | string): Promise<MeetingRoom> {
    const meetingRoom = await this.meetingRepository.findOne({
      where: { id: +id },
      relations: { location: true },
    })

    if (!meetingRoom) {
      throw new ErrorException(MEETING_ROOM_NOT_EXIST, '会议室不存在')
    }

    return meetingRoom
  }

  /**
   * 修改会议室信息
   * @param meetingRoomInfoDto
   */
  async updateMeetingRoomInfo(
    meetingRoomInfoDto: UpdateMeetingRoomInfoDto,
  ): Promise<any> {
    const mRoom = await this.getMeetingRoomById(meetingRoomInfoDto.id)

    const existError = await this.checkExistMeetingRoom(meetingRoomInfoDto.name)
    if (existError) {
      throw existError
    }

    mRoom.name = meetingRoomInfoDto.name ?? mRoom.name
    mRoom.capacity = meetingRoomInfoDto.capacity ?? mRoom.capacity

    if (meetingRoomInfoDto.equipmentsIds) {
      // 获取设备
      const equipments = await this.equipmentService.getEquipmentByIds(
        meetingRoomInfoDto.equipmentsIds,
      )
      mRoom.equipments = equipments
    }

    const connection = this.meetingRepository.manager.connection

    try {
      return await connection.transaction(
        async (transactionalEntityManager) => {
          if (meetingRoomInfoDto.locationId) {
            // 获取地点
            const [prevLocation, nextLocation] = await Promise.all([
              await this.locationService.getLocationById(mRoom.location.id),
              await this.locationService.getLocationById(
                +meetingRoomInfoDto.locationId,
              ),
            ])

            if (nextLocation.isUsed) {
              throw new ErrorException(LOCATION_IS_USED, '地点已被使用')
            }

            prevLocation.isUsed = false
            nextLocation.isUsed = true

            mRoom.location = nextLocation

            await transactionalEntityManager.save([prevLocation, nextLocation])
          }

          await transactionalEntityManager.save(mRoom)
          return '更新成功'
        },
      )
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '更新异常: ' + error.message)
    }
  }

  /**
   * 删除会议室
   */
  async deleteMeetingRoom(id: number): Promise<any> {
    const mRoom = await this.getMeetingRoomById(id)

    const connection = this.meetingRepository.manager.connection

    try {
      return await connection.transaction(
        async (transactionalEntityManager) => {
          const location = await this.locationService.getLocationById(
            mRoom.location.id,
          )

          location.isUsed = false

          await Promise.all([
            transactionalEntityManager.save(location),
            transactionalEntityManager.remove(mRoom),
          ])

          return '删除成功'
        },
      )
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '删除异常: ' + error.message)
    }
  }

  /**
   * 用户会议室分页列表 (按照 UpdatedAt 进行排序)
   * @param page
   * @param limit
   */
  async paginate(
    page: number,
    limit: number,
    keyword?: string,
  ): Promise<MeetingRoomListVo> {
    const queryBuilder = this.meetingRepository.createQueryBuilder('meeting')
    queryBuilder
      .leftJoinAndSelect('meeting.equipments', 'equipment')
      .leftJoinAndSelect('meeting.location', 'location')

    if (keyword) {
      queryBuilder.andWhere('meeting.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
    }

    const [paginate] = await paginateRawAndEntities(
      queryBuilder.orderBy('meeting.updated_at', 'DESC'),
      getPaginationOptions(page, limit),
    )

    return { list: paginate.items, meta: paginate.meta }
  }

  async initData() {
    const location1 = new Location()
    location1.name = 'location_1'
    location1.code = 'lo_1'
    location1.isUsed = true

    const location2 = new Location()
    location2.name = 'location_2'
    location2.code = 'lo_2'
    location2.isUsed = true

    const location3 = new Location()
    location3.name = 'location_3'
    location3.code = 'lo_3'
    location3.isUsed = true

    const equipment1 = new Equipment()
    equipment1.name = '白板'
    equipment1.code = 'whiteboard'

    const equipment2 = new Equipment()
    equipment2.name = '屏幕'
    equipment2.code = 'screen'

    const room1 = new MeetingRoom()
    room1.name = '木星'
    room1.capacity = 10
    room1.equipments = [equipment1]
    room1.location = location1

    const room2 = new MeetingRoom()
    room2.name = '金星'
    room2.capacity = 5
    room2.equipments = [equipment2]
    room2.location = location2

    const room3 = new MeetingRoom()
    room3.name = '天王星'
    room3.capacity = 30
    room3.equipments = [equipment1, equipment2]
    room3.location = location3

    try {
      await this.locationRepository.save([location1, location2, location3])
      await this.equipmentRepository.save([equipment1, equipment2])
      await this.meetingRepository.save([room1, room2, room3])
      return '初始化成功'
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '初始化异常: ' + error.message)
    }
  }
}
