import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Location } from '../location/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Equipment, Location])],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
