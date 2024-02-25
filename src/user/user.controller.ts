import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from 'src/decorator/public.decorator';

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
