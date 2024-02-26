import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: ' permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, comment: 'permission_code' })
  code: string;

  @Column({ length: 100, comment: 'permission_desc' })
  description: string;
}
