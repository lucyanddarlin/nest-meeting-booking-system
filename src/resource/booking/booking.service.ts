import { Inject, Injectable } from '@nestjs/common'
import { CreateBookingDto } from './dto/create-booking.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Booking, BookingState } from './entities/booking.entity'
import { Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'
import {
  MeetingRoom,
  MeetingRoomState,
} from '../meeting-room/entities/meeting-room.entity'
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter'
import { COMMON_ERR } from 'src/constants/error/common'
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate'
import { getPaginationOptions } from 'src/utils/paginate'
import BookingListVo from './vo/booking-list.vo'
import { MeetingRoomService } from '../meeting-room/meeting-room.service'
import { UserService } from '../user/user.service'
import { PayLoad } from '../user/dto/login-user.dto'
import {
  MEETING_ROOM_INVALID,
  MEETING_TIME_INVALID,
} from 'src/constants/error/meeting'
import to from 'src/utils/to'
import { RedisService } from '../redis/redis.service'
import { BOOKING_URGE_TIME_INTERVAL, CAPTCHA_KEY } from 'src/constants/captcha'
import { BOOKING_BUSY_URGE } from 'src/constants/error/booking'
import { CaptchaService } from '../captcha/captcha.service'

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>

  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>

  @Inject(MeetingRoomService)
  private readonly meetingRoomService: MeetingRoomService

  @Inject(UserService)
  private readonly userService: UserService

  @Inject(RedisService)
  private readonly redisService: RedisService

  @Inject(CaptchaService)
  private readonly captchaService: CaptchaService

  /**
   * 创建预订
   * @param bookingDto
   */
  async createBooking(
    payLoad: PayLoad,
    bookingDto: CreateBookingDto,
  ): Promise<any> {
    if (bookingDto.startTime >= bookingDto.endTime) {
      throw new ErrorException(MEETING_TIME_INVALID, '会议时间异常')
    }

    // 获取会议室, 参与人, 会议发起人
    const [meetingRoom, participants, user] = await Promise.all([
      this.meetingRoomService.getMeetingRoomById(bookingDto.meetingRoomId),
      this.userService.getUserInfoByIds(bookingDto.userIds),
      this.userService.getUserById(payLoad.id, payLoad.isAdmin),
    ])

    if (meetingRoom.state !== MeetingRoomState.isCreated) {
      throw new ErrorException(MEETING_ROOM_INVALID, '会议室不可用')
    }

    const existRoomsCounts = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.meeting', 'meeting')
      .andWhere('meeting.id = :mid', { mid: meetingRoom.id })
      .andWhere('booking.startTime <= :startTime', {
        startTime: bookingDto.startTime,
      })
      .orWhere('booking.endTime >= :endTime', { endTime: bookingDto.endTime })
      .getCount()

    if (existRoomsCounts !== 0) {
      throw new ErrorException(MEETING_TIME_INVALID, '会议时间冲突')
    }

    const booking = new Booking()
    booking.meetingRoom = meetingRoom
    booking.state = BookingState.Applying
    booking.user = user
    booking.startTime = new Date(bookingDto.startTime)
    booking.endTime = new Date(bookingDto.endTime)

    meetingRoom.state = MeetingRoomState.isBooked

    const connect = this.bookingRepository.manager.connection

    try {
      return await connect.transaction(async (transactionalEntityManager) => {
        await Promise.all([
          transactionalEntityManager.save(meetingRoom),
          transactionalEntityManager.save(booking),
        ])

        return '预订成功'
      })
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '预订异常: ' + error.message)
    }
  }

  /**
   * 更新预订状态
   * @param id
   * @param nextState
   */
  async updateBookingState(id: number, nextState: BookingState): Promise<any> {
    const [err] = await to(
      this.bookingRepository.update(id, { state: nextState }),
    )

    if (err) {
      throw new ErrorException(COMMON_ERR, '更新异常: ' + err.message)
    }

    return '更新成功'
  }

  /**
   * 催办预订
   * @param id
   */
  async urgeBooking(id: number) {
    const captchaKey = `${CAPTCHA_KEY.urge_booking}${id}`
    const hasUrged = await this.redisService.get(captchaKey)

    if (hasUrged) {
      throw new ErrorException(BOOKING_BUSY_URGE, '催办频繁, 请稍后再试')
    }

    let adminEmail = await this.redisService.get('admin_email')

    if (!adminEmail) {
      adminEmail = (
        await this.userRepository.findOne({
          select: { email: true },
          where: { isAdmin: true },
        })
      ).email

      await this.redisService.set('admin_email', adminEmail)
    }

    try {
      await Promise.all([
        this.captchaService.sendEmailCaptcha({
          to: adminEmail,
          subject: '会议预订提醒',
          html: `id 为 ${id} 的会议预订正在等待审批`,
        }),
        this.redisService.set(captchaKey, 1, BOOKING_URGE_TIME_INTERVAL),
      ])
      return '催办成功'
    } catch (error) {
      this.redisService.del(captchaKey)

      throw new ErrorException(COMMON_ERR, '催办异常: ' + error.message)
    }
  }

  /**
   * 预订列表分页
   * @param page
   * @param limit
   */
  async paginate(
    page: number,
    limit: number,
    username?: string,
    mRoomName?: string,
    locationName?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<BookingListVo> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.meetingRoom', 'meeting')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('meeting.location', 'location')

    if (username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      })
    }

    if (mRoomName) {
      query.andWhere('meeting.name LIKE :mRoomName', {
        mRoomName: `%${mRoomName}%`,
      })
    }

    if (locationName) {
      query.andWhere('location.name LIKE :locationName', {
        locationName: `%${locationName}%`,
      })
    }

    if (startTime) {
      if (!endTime) {
        endTime = +startTime + 60 * 60 * 1000
      }
      query.andWhere('booking.startTime BETWEEN :startTime AND :endTime', {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      })
    }

    const [{ items, meta }] = await paginateRawAndEntities(
      query,
      getPaginationOptions(page, limit),
    )

    return { list: items, meta }
  }

  /**
   * 开发环境初始化环境
   */
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
    } catch (error) {
      throw new ErrorException(COMMON_ERR, '初始化异常: ' + error.message)
    }
  }
}
