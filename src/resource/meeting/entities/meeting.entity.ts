import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'meeting_name' })
  name: string;

  @Column({ length: 50, comment: 'meeting_capacity' })
  capacity: number;

  @Column({ length: 50, default: '', comment: 'equipment' })
  equipment: string;

  @Column({ length: 100, default: '', comment: 'description' })
  description: string;

  @Column({ default: false, comment: 'is_booked' })
  isBooked: boolean;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;
}
