import { Module, forwardRef } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { MeetingRoomController } from './meeting-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Location } from '../location/entities/location.entity';
import { EquipmentModule } from '../equipment/equipment.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingRoom, Equipment, Location]),
    EquipmentModule,
    forwardRef(() => LocationModule),
  ],
  controllers: [MeetingRoomController],
  providers: [MeetingRoomService],
  exports: [MeetingRoomService],
})
export class MeetingRoomModule {}
