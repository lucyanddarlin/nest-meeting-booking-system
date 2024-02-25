import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';
import {
  UpdateBaseUserInfoDto,
  updateUserPasswordDto,
  updateUserStatusDto,
} from './dto/update-user.dto';
import { PayloadUser } from 'src/decorator/userinfo.decorator';
import { defaultPaginationParams } from 'src/constants/paginate';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.userService.register(user);
  }

  @Public()
  @Post('login')
  userLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser);
  }

  @Public()
  @Post('admin/login')
  adminLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser, true);
  }

  @Post('info/base/update')
  updateBaseUserInfo(
    @PayloadUser('id') id: number,
    @Body() baseUserInfo: UpdateBaseUserInfoDto,
  ) {
    return this.userService.updateUserBaseInfo(id, baseUserInfo);
  }

  @Post('password/update')
  updateUserPassword(
    @PayloadUser('id') id: number,
    @Body() pwdObj: updateUserPasswordDto,
  ) {
    return this.userService.updateUserPassword(id, pwdObj);
  }

  @Post('status/update')
  updateUserStatus(
    @PayloadUser('id') id: number,
    @Body() statusObj: updateUserStatusDto,
  ) {
    return this.userService.updateUserStatus(id, statusObj);
  }

  @Get('list')
  getUserList(
    @Query(
      'page',
      new DefaultValuePipe(defaultPaginationParams.currentPage),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(defaultPaginationParams.pageSize),
      ParseIntPipe,
    )
    limit: number,
  ) {
    return this.userService.paginate(page, limit);
  }

  @Public()
  @Get('refresh/token')
  refreshToken(@Query('refreshToken') token: string) {
    return this.userService.handleRefreshToken(token);
  }

  @Public()
  @Get('dev-init')
  initDevData() {
    return this.userService.initDevData();
  }
}
