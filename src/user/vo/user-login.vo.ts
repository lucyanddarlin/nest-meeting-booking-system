import { ApiProperty } from '@nestjs/swagger';

export class LoginVo {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
