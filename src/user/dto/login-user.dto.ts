import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'username cannot be empty' })
  username: string;

  @ApiProperty()
  @MinLength(6, { message: "password's length should more than 6" })
  @IsNotEmpty({ message: 'password cannot be empty' })
  password: string;
}

type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

export type UserInfo = Merge<
  Omit<User, 'password'>,
  {
    roles: string[];
    permissions: Permission[];
  }
>;

export interface PayLoad extends Partial<UserInfo> {}

// TODO: 迁移至 vo 目录
export class LoginVo {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
