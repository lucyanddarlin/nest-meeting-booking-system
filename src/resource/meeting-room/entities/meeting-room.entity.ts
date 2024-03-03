import { Equipment } from 'src/resource/equipment/entities/equipment.entity';
import { Location } from 'src/resource/location/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MeetingRoomState {
  isCreated,
  isBooked,
  isStarted,
  isEnded,
  isDeleted,
}

@Entity('meeting_room')
export class MeetingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'meeting_name' })
  name: string;

  @Column({ comment: 'meeting_capacity' })
  capacity: number;

  @Column({ length: 100, default: '', comment: 'description' })
  description: string;

  @Column({
    type: 'enum',
    enum: MeetingRoomState,
    default: MeetingRoomState.isCreated,
  })
  state: MeetingRoomState;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;

  @JoinColumn({ name: 'location_id' })
  @OneToOne(() => Location, (location) => location.meeting)
  location: Location;

  @JoinTable({ name: 'meeting_equipments' })
  @ManyToMany(() => Equipment, (e) => e.meetings)
  equipments: Equipment[];
}
