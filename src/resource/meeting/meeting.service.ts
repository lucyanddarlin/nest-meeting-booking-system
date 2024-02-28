import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import { COMMON_ERR } from 'src/constants/error/common';

@Injectable()
export class MeetingService {
  @InjectRepository(Meeting)
  private readonly meetingRepository: Repository<Meeting>;

  @InjectRepository(Equipment)
  private readonly equipmentRepository: Repository<Equipment>;

  async initData() {
    const equipment1 = new Equipment();
    equipment1.name = '白板';
    equipment1.code = 'whiteboard';

    const equipment2 = new Equipment();
    equipment2.name = '屏幕';
    equipment2.code = 'screen';

    const room1 = new Meeting();
    room1.name = '木星';
    room1.capacity = 10;
    room1.location = '一层西';
    room1.equipments = [equipment1];

    const room2 = new Meeting();
    room2.name = '金星';
    room2.capacity = 5;
    room2.location = '二层东';
    room2.equipments = [equipment2];

    const room3 = new Meeting();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.location = '三层东';
    room3.equipments = [equipment1, equipment2];

    try {
      await this.equipmentRepository.insert([equipment1, equipment2]);
      await this.meetingRepository.insert([room1, room2, room3]);
      return '初始化成功';
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '初始化异常: ' + error.message);
    }
  }
}
