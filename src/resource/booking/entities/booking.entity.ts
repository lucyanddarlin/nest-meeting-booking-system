import { MeetingRoom } from 'src/resource/meeting-room/entities/meeting-room.entity'
import { User } from 'src/resource/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum BookingState {
  Applying, // 申请中
  Passed, // 已通过
  Failed, // 已驳回
  IsDeleted, // 已删除
}

@Entity('booking')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'start_time', comment: 'meeting_start_time' })
  startTime: Date

  @Column({ name: 'end_time', comment: 'meeting_end_time' })
  endTime: Date

  @Column({ type: 'enum', enum: BookingState, default: BookingState.Applying })
  state: BookingState

  @Column({ length: 100, default: '', comment: 'booking_note' })
  note: string

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => MeetingRoom)
  meetingRoom: MeetingRoom
}
