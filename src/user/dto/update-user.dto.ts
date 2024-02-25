import { IsMobilePhone, MaxLength } from 'class-validator';

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
