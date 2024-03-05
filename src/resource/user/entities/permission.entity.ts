import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, comment: 'permission_code' })
  code: string

  @Column({ length: 100, comment: 'permission_desc' })
  description: string

  @CreateDateColumn({ name: 'created_at', comment: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' })
  updatedAt: Date
}
