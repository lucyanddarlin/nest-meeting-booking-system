import {
  IsBoolean,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateBaseUserInfoDto {
  @MaxLength(15, { message: 'nickname is too long' })
  nickname?: string;

  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phone format is wrong' },
  )
  phone?: string;

  avatar?: string;
}

export class updateUserPasswordDto {
  @IsNotEmpty({ message: 'captcha cannot not be null' })
  captcha: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  oldPassword: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  newPassword: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(6, { message: "password's length should more than 6" })
  newPasswordConfirm: string;
}

export class updateUserStatusDto {
  @IsBoolean({ message: 'isFrozen should be boolean' })
  @IsOptional()
  isFrozen?: boolean;
}
