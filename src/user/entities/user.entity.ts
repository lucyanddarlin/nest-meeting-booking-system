import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'username' })
  username: string;

  @Column({ length: 100, comment: 'pwd' })
  password: string;

  @Column({ name: 'nickname', length: 50, comment: 'nick_name' })
  nickName: string;

  @Column({ comment: 'email' })
  email: string;

  @Column({ length: 100, nullable: true, comment: 'avatar' })
  avatar: string;

  @Column({ length: 20, nullable: true, comment: 'phone' })
  phone: string;

  @Column({ default: false, comment: 'is admin' })
  isAdmin: boolean;

  @Column({ default: false, comment: 'is_frozen' })
  isFrozen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
