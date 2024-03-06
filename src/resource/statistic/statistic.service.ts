import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Booking } from '../booking/entities/booking.entity'
import { Repository, SelectQueryBuilder } from 'typeorm'
import to from 'src/utils/to'
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter'
import { COMMON_ERR } from 'src/constants/error/common'
import { MEETING_TIME_INVALID } from 'src/constants/error/meeting'

@Injectable()
export class StatisticService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>

  /**
   * 根据 query 获取数据
   * @param query
   */
  private async getManyByQuery(
    query: SelectQueryBuilder<Booking>,
    startTime?: number,
    endTime?: number,
  ): Promise<any[]> {
    if (startTime) {
      if (!endTime) {
        endTime = +startTime + 60 * 60 * 1000
      }
      if (startTime >= endTime) {
        throw new ErrorException(MEETING_TIME_INVALID, '时间不合法')
      }
      query.where('booking.start_time BETWEEN :time1 AND :time2', {
        time1: new Date(startTime),
        time2: new Date(endTime),
      })
    }

    const [err, many] = await to(query.getRawMany())

    if (err) {
      throw new ErrorException(COMMON_ERR, '获取异常: ' + err.message)
    }

    return many
  }

  /**
   * 统计用户预订
   * @param startTime
   * @param endTime
   * @returns
   */
  async userBookingCount(startTime?: number, endTime?: number): Promise<any> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .select('u.id', 'userId')
      .addSelect('u.username', 'username')
      .leftJoin('booking.user', 'u', 'booking.userId = u.id')
      .addSelect('count(1)', 'bookingCount')
      .addGroupBy('booking.user')

    return await this.getManyByQuery(query, startTime, endTime)
  }

  /**
   * 统计会议室预订
   * @param startTime
   * @param endTime
   * @returns
   */
  async meetingBookingCount(
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .leftJoin('booking.meetingRoom', 'm', 'booking.meetingRoomId = m.id')
      .addSelect('count(1)', 'usedCount')
      .addGroupBy('booking.meetingRoomId')

    return await this.getManyByQuery(query, startTime, endTime)
  }
}
