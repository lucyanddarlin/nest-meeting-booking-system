import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { CustomPaginationMeta } from 'src/utils/paginate';

export class UserListVo {
  @ApiProperty({ type: [User] })
  list: Array<Omit<User, 'password'>>;

  @ApiProperty()
  meta: CustomPaginationMeta;
}
