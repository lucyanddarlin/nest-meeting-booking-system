import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';
import {
  CAPTCHA_INCORRECT,
  CAPTCHA_NOT_EXIST,
  PASSWORD_NOT_CONFIRM,
  TOKEN_INVALID,
  USER_IS_FROZEN,
  USER_NAME_EXIST,
  USER_PASSWORD_INCORRECT,
} from 'src/constants/error/user';
import to from 'src/utils/to';
import { COMMON_ERR } from 'src/constants/error/common';
import { AuthService } from 'src/auth/auth.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto, LoginVo, PayLoad } from './dto/login-user.dto';
import {
  UpdateBaseUserInfoDto,
  updateUserPasswordDto,
} from './dto/update-user.dto';
import { UserNotExistError } from 'src/common/exceptions/common/user.exceptions';
import { CAPTCHA_KEY } from 'src/constants/captcha';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  /**
   * 注册用户
   * @param user
   */
  async register(user: CreateUserDto): Promise<string> {
    const captchaKey = `${CAPTCHA_KEY.user_register}${user.email}`;
    const captcha = await this.redisService.get(captchaKey);

    if (!captcha) {
      throw new ErrorException(CAPTCHA_NOT_EXIST, '验证码不存在或已过期');
    }

    if (user.captcha !== captcha) {
      throw new ErrorException(CAPTCHA_INCORRECT, '验证码错误');
    }

    const existUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (existUser) {
      throw new ErrorException(USER_NAME_EXIST, '用户已存在');
    }

    const hashPwd = await this.authService.hashPassword(user.password);

    const nextUser = new User();
    nextUser.username = user.username;
    nextUser.nickName = user.nickname;
    nextUser.password = hashPwd;
    nextUser.email = user.email;

    const [err] = await to(this.userRepository.save(nextUser));
    if (err) {
      this.logger.error(JSON.stringify(err));
      throw new ErrorException(COMMON_ERR, JSON.stringify(err));
    }

    await this.redisService.del(captchaKey);

    return '注册成功';
  }

  /**
   * 用户登陆
   * @param loginUser 登陆信息
   */
  async login(loginUser: LoginUserDto, isAdmin?: boolean): Promise<LoginVo> {
    const existUser = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!existUser) {
      throw new UserNotExistError();
    }

    if (existUser.isFrozen) {
      throw new ErrorException(
        USER_IS_FROZEN,
        '用户已冻结',
        HttpStatus.FORBIDDEN,
      );
    }

    const pwdVerification = await this.authService.verifyPassword(
      loginUser.password,
      existUser.password,
    );
    if (!pwdVerification) {
      throw new ErrorException(USER_PASSWORD_INCORRECT, '密码错误');
    }

    const payload = convertUserPayLoad(existUser);

    const vo = new LoginVo();
    vo.accessToken = this.authService.generateAccessToken(payload);
    vo.refreshToken = this.authService.generateRefreshToken(payload);

    return vo;
  }

  /**
   * 根据 id 查询用户 (包含对应的角色和权限)
   */
  async findUserById(id: number, isAdmin: boolean): Promise<PayLoad> {
    const existUser = await this.userRepository.findOne({
      where: {
        id,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!existUser) {
      throw new UserNotExistError();
    }

    return convertUserPayLoad(existUser);
  }

  /**
   * 修改用户基础信息
   * @param id
   * @param nextBaseInfo
   */
  async updateUserBaseInfo(id: number, nextBaseInfo: UpdateBaseUserInfoDto) {
    const existUser = await this.userRepository.findOne({ where: { id } });
    if (!existUser) {
      throw new UserNotExistError();
    }
    const phone = nextBaseInfo.phone ?? existUser.phone;
    const nickName = nextBaseInfo.nickname ?? existUser.nickName;
    const avatar = nextBaseInfo.avatar ?? existUser.avatar;
    const nextUser: User = { ...existUser, phone, nickName, avatar };
    const [err] = await to(this.userRepository.save(nextUser));
    if (err) {
      throw new ErrorException(COMMON_ERR, '更新用户信息异常: ' + err.message);
    }

    return '修改用户基础信息成功';
  }

  /**
   * 修改用户密码
   * @param id
   * @param pwdObj
   */
  async updateUserPassword(id: number, pwdObj: updateUserPasswordDto) {
    if (pwdObj.newPassword !== pwdObj.newPasswordConfirm) {
      throw new ErrorException(PASSWORD_NOT_CONFIRM, '密码不一致');
    }
    const existUser = await this.userRepository.findOne({ where: { id } });
    if (!existUser) {
      throw new UserNotExistError();
    }

    const captchaCode = await this.redisService.get(
      `${CAPTCHA_KEY.update_password}${existUser.email}`,
    );
    if (!captchaCode) {
      throw new ErrorException(CAPTCHA_NOT_EXIST, '验证码无效');
    }

    const verifyPassword = await this.authService.verifyPassword(
      pwdObj.oldPassword,
      existUser.password,
    );
    if (!verifyPassword) {
      throw new ErrorException(USER_PASSWORD_INCORRECT, '旧用户密码错误');
    }

    const password = await this.authService.hashPassword(pwdObj.newPassword);

    const [err] = await to(
      this.userRepository.save({ ...existUser, password }),
    );

    if (err) {
      throw new ErrorException(COMMON_ERR, '修改密码异常');
    }

    await this.redisService.del(
      `${CAPTCHA_KEY.update_password}${existUser.email}`,
    );

    return '修改用户密码成功';
  }

  /**
   * 处理 refresh token
   */
  async handleRefreshToken(refreshToken: string): Promise<LoginVo> {
    try {
      const verifyData = this.authService.verifyRefreshToken(refreshToken);
      const existUser = await this.findUserById(
        verifyData.userId,
        verifyData.isAdmin,
      );

      return {
        accessToken: this.authService.generateAccessToken(existUser),
        refreshToken: this.authService.generateRefreshToken(existUser),
      };
    } catch (error) {
      throw new ErrorException(
        TOKEN_INVALID,
        'token 无效: ' + error.message ?? '',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /**
   * 开发环境-数据初始化
   */
  async initDevData() {
    const user1 = new User();
    user1.username = 'darlin';
    user1.password = await this.authService.hashPassword('111111');
    user1.email = 'darlin@xx.com';
    user1.isAdmin = true;
    user1.nickName = 'darlin';
    user1.phone = '13233323333';

    const user2 = new User();
    user2.username = 'lily';
    user2.password = await this.authService.hashPassword('111111');
    user2.email = 'lily@yy.com';
    user2.nickName = 'lily';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);

    return 'init successfully';
  }
}

const convertUserPayLoad = (user: User): PayLoad => {
  return {
    id: user.id,
    isAdmin: user.isAdmin,
    username: user.username,
    roles: user.roles.map((r) => r.name),
    permissions: user.roles.reduce<Permission[]>((arr, cur) => {
      cur.permissions.forEach((permission) => {
        const exist = arr.find((p) => p.code === permission.code);
        if (!exist) {
          arr.push(permission);
        }
      });
      return arr;
    }, []),
  };
};
