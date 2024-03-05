import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateBaseUserInfoDto {
  @ApiProperty()
  @MaxLength(15, { message: 'nickname is too long' })
  nickname?: string

  @ApiProperty()
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phone format is wrong' },
  )
  phone?: string

  avatar?: string
}

export class updateUserPasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'captcha cannot not be null' })
  captcha: string

  @ApiProperty()
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  oldPassword: string

  @ApiProperty()
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  newPassword: string

  @ApiProperty()
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  newPasswordConfirm: string
}

export class updateUserStatusDto {
  @ApiProperty()
  @IsBoolean({ message: 'isFrozen should be boolean' })
  @IsOptional()
  isFrozen?: boolean
}
