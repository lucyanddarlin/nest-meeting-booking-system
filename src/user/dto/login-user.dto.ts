import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';

export class LoginUserDto {
  @IsNotEmpty({ message: 'username cannot be empty' })
  username: string;

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

export class LoginVo {
  accessToken: string;

  refreshToken: string;
}
