import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { Public } from 'src/decorator/public.decorator'
import {
  UpdateBaseUserInfoDto,
  updateUserPasswordDto,
  updateUserStatusDto,
} from './dto/update-user.dto'
import { PayloadUser } from 'src/decorator/userinfo.decorator'
import { defaultPaginationParams } from 'src/constants/paginate'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginVo } from './vo/user-login.vo'

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '用户注册' })
  @Public()
  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.userService.register(user)
  }

  @ApiOperation({ summary: '普通用户登陆' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginVo })
  @Public()
  @Post('login')
  userLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser)
  }

  @ApiOperation({ summary: '管理员用户登陆' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginVo })
  @Public()
  @Post('admin/login')
  adminLogin(@Body() loginUser: LoginUserDto) {
    return this.userService.login(loginUser, true)
  }

  @ApiOperation({ summary: '更新用户基础信息' })
  @Post('info/base/update')
  updateBaseUserInfo(
    @PayloadUser('id') id: number,
    @Body() baseUserInfo: UpdateBaseUserInfoDto,
  ) {
    return this.userService.updateUserBaseInfo(id, baseUserInfo)
  }

  @ApiOperation({ summary: '更新用户密码' })
  @Post('password/update')
  updateUserPassword(
    @PayloadUser('id') id: number,
    @Body() pwdObj: updateUserPasswordDto,
  ) {
    return this.userService.updateUserPassword(id, pwdObj)
  }

  @ApiOperation({ summary: '更新用户状态' })
  @Post('status/update')
  updateUserStatus(
    @PayloadUser('id') id: number,
    @Body() statusObj: updateUserStatusDto,
  ) {
    return this.userService.updateUserStatus(id, statusObj)
  }

  @ApiOperation({ summary: '用户列表分页' })
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
    return this.userService.paginate(page, limit)
  }

  @ApiOperation({ summary: 'refresh token 处理 ' })
  @Public()
  @Get('refresh/token')
  refreshToken(@Query('refreshToken') token: string) {
    return this.userService.handleRefreshToken(token)
  }

  @ApiOperation({ summary: '开发环境初始化数据' })
  @Public()
  @Get('dev-init')
  initDevData() {
    return this.userService.initDevData()
  }
}
