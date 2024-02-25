import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { UpdateBaseUserInfoDto } from './dto/update-user.dto';
import { PayloadUser } from 'src/decorator/userinfo.decorator';

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
