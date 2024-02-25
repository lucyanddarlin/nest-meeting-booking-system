import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.userService.register(user);
  }

  @Post('login')
  userLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser);
  }

  @Post('admin/login')
  adminLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser, true);
  }

  @Get('dev-init')
  initDevData() {
    return this.userService.initDevData();
  }
}
