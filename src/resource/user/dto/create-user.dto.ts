import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
export class CreateUserDto {
  @ApiProperty({ name: 'username' })
  @IsNotEmpty({ message: 'username cannot empty' })
  username: string

  @ApiProperty({ name: 'nickname' })
  @IsNotEmpty({ message: 'nickname cannot be empty' })
  nickname: string

  @ApiProperty({ name: 'password' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  password: string

  @ApiProperty({ name: 'email' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail({}, { message: 'email format is wrong' })
  email: string

  @ApiProperty({ name: 'captcha' })
  @IsNotEmpty({ message: 'captcha cannot be null' })
  captcha: string
}
