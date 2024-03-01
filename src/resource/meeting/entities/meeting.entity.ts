import { Equipment } from 'src/resource/equipment/entities/equipment.entity';
import { Location } from 'src/resource/location/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meeting_room')
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'meeting_name' })
  name: string;

  @Column({ comment: 'meeting_capacity' })
  capacity: number;

  @Column({ length: 100, default: '', comment: 'description' })
  description: string;

  @Column({ name: 'is_booked', default: false, comment: 'is_booked' })
  isBooked: boolean;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Location, (location) => location.meeting)
  location: Location;

  @JoinTable({ name: 'meeting_equipments' })
  @ManyToMany(() => Equipment, (e) => e.meetings)
  equipments: Equipment[];
}
