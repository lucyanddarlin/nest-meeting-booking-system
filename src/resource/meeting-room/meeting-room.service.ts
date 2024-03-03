import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import { COMMON_ERR } from 'src/constants/error/common';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { getPaginationOptions } from 'src/utils/paginate';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRepository: Repository<MeetingRoom>;

  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>;

  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  /**
   * 创建会议室
   * @param meetingDto
   */
  async createMeetingRoom(meetingDto: CreateMeetingRoomDto): Promise<any> {}

  /**
   * 用户会议室分页列表 (按照 UpdatedAt 进行排序)
   * @param page
   * @param limit
   */
  async paginate(page: number, limit: number): Promise<MeetingRoomListVo> {
    const queryBuilder = this.meetingRepository.createQueryBuilder('meeting');
    queryBuilder
      .leftJoinAndSelect('meeting.equipments', 'equipment')
      .orderBy('meeting.updated_at', 'DESC');

    const [paginate] = await paginateRawAndEntities(
      queryBuilder,
      getPaginationOptions(page, limit),
    );

    return { list: paginate.items, meta: paginate.meta };
  }

  async initData() {
    const equipment1 = new Equipment();
    equipment1.name = '白板';
    equipment1.code = 'whiteboard';

    const equipment2 = new Equipment();
    equipment2.name = '屏幕';
    equipment2.code = 'screen';

    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipments = [equipment1];

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipments = [equipment2];

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipments = [equipment1, equipment2];

    const location1 = new Location();
    location1.name = 'location_1';
    location1.code = 'lo_1';
    location1.isUsed = true;
    location1.meeting = room1;

    const location2 = new Location();
    location2.name = 'location_2';
    location2.code = 'lo_2';
    location2.isUsed = true;
    location2.meeting = room2;

    const location3 = new Location();
    location3.name = 'location_3';
    location3.code = 'lo_3';
    location3.isUsed = true;
    location3.meeting = room3;

    try {
      await this.equipmentRepository.save([equipment1, equipment2]);
      await this.meetingRepository.save([room1, room2, room3]);
      await this.locationRepository.save([location1, location2, location3]);
      return '初始化成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '初始化异常: ' + error.message);
    }
  }
}
