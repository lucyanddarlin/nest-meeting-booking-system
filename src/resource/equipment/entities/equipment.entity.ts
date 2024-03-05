import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { MeetingRoom } from 'src/resource/meeting-room/entities/meeting-room.entity'

export enum EquipmentState {
  ok,
  broken,
  Repairing,
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, comment: 'equipment_name' })
  name: string

  @Column({ length: 50, comment: 'equipment_code' })
  code: string

  @Column({ default: 50, comment: 'available_quantity' })
  availableQuantity: number

  @Column({ type: 'enum', enum: EquipmentState, default: EquipmentState.ok })
  state: EquipmentState

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => MeetingRoom, (m) => m.equipments)
  meetings: MeetingRoom[]
}
