import { MeetingRoom } from 'src/resource/meeting-room/entities/meeting-room.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'location_name' })
  name: string;

  @Column({ length: 50, comment: 'location_code' })
  code: string;

  @Column({ name: 'is_used', default: false, comment: 'location_is_used' })
  isUsed: boolean;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;

  @JoinColumn({ name: 'meeting_id' })
  @OneToOne(() => MeetingRoom)
  meeting: MeetingRoom;
}
