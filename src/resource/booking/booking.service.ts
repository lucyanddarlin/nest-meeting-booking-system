import { Injectable } from '@nestjs/common'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UpdateBookingDto } from './dto/update-booking.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Booking } from './entities/booking.entity'
import { Repository } from 'typeorm'
import { ApiOperation } from '@nestjs/swagger'
import { User } from '../user/entities/user.entity'
import { MeetingRoom } from '../meeting-room/entities/meeting-room.entity'

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>

  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>

  @ApiOperation({ summary: '开发环境初始化数据' })
  async initDevData() {
    try {
      const user1 = await this.userRepository.findOne({ where: { id: 1 } })
      const user2 = await this.userRepository.findOne({ where: { id: 2 } })

      const mRoom1 = await this.meetingRoomRepository.findOne({
        where: { id: 1 },
      })
      const mRoom2 = await this.meetingRoomRepository.findOne({
        where: { id: 2 },
      })

      const booking1 = new Booking()
      booking1.meetingRoom = mRoom1
      booking1.user = user1
      booking1.startTime = new Date()
      booking1.endTime = new Date(Date.now() + 1000 * 60 * 60)

      const booking2 = new Booking()
      booking2.meetingRoom = mRoom2
      booking2.user = user2
      booking2.startTime = new Date()
      booking2.endTime = new Date(Date.now() + 1000 * 60 * 60)

      const booking3 = new Booking()
      booking3.meetingRoom = mRoom1
      booking3.user = user2
      booking3.startTime = new Date()
      booking3.endTime = new Date(Date.now() + 1000 * 60 * 60)

      const booking4 = new Booking()
      booking4.meetingRoom = mRoom2
      booking4.user = user1
      booking4.startTime = new Date()
      booking4.endTime = new Date(Date.now() + 1000 * 60 * 60)

      await this.bookingRepository.save([
        booking1,
        booking2,
        booking3,
        booking4,
      ])

      return '初始化成功'
    } catch (error) {}
  }
}
