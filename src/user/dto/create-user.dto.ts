import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty({ message: 'username cannot empty' })
  username: string;

  @IsNotEmpty({ message: 'nickname cannot be empty' })
  nickname: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  password: string;

  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail({}, { message: 'email format is wrong' })
  email: string;

  @IsNotEmpty({ message: 'captcha cannot be null' })
  captcha: string;
}
