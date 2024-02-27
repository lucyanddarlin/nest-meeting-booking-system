import { Equipment } from 'src/resource/equipment/entities/equipment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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

  @Column({ length: 50, default: '', comment: 'location' })
  location: string;

  @Column({ length: 100, default: '', comment: 'description' })
  description: string;

  @Column({ default: false, comment: 'is_booked' })
  isBooked: boolean;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;

  @JoinTable({ name: 'meeting_equipments' })
  @ManyToMany(() => Equipment, (e) => e.meetings)
  equipments: Equipment[];
}
