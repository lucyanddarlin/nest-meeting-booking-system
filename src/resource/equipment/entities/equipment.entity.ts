import { Meeting } from 'src/resource/meeting/entities/meeting.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'equipment_name' })
  name: string;

  @Column({ length: 50, comment: 'equipment_code' })
  code: string;

  @Column({ default: 50, comment: 'available_quantity' })
  availableQuantity: number;

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Meeting, (m) => m.equipments)
  meetings: Meeting[];
}
