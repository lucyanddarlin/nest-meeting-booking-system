import { Module } from '@nestjs/common'
import { BookingService } from './booking.service'
import { BookingController } from './booking.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Booking } from './entities/booking.entity'
import { User } from '../user/entities/user.entity'
import { MeetingRoom } from '../meeting-room/entities/meeting-room.entity'
import { MeetingRoomModule } from '../meeting-room/meeting-room.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, MeetingRoom]),
    MeetingRoomModule,
    UserModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
