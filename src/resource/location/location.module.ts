import { Module, forwardRef } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { MeetingRoomModule } from '../meeting-room/meeting-room.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    forwardRef(() => MeetingRoomModule),
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
