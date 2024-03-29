import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './resource/user/user.module'
import { User } from './resource/user/entities/user.entity'
import { Role } from './resource/user/entities/role.entity'
import { Permission } from './resource/user/entities/permission.entity'
import { RedisModule } from './resource/redis/redis.module'
import { CaptchaModule } from './resource/captcha/captcha.module'
import { AuthModule } from './resource/auth/auth.module'
import { LoginGuard } from './guard/login.guard'
import { PermissionGuard } from './guard/permission.guard'
import LogMiddleware from './middleware/log'
import { TransformInterceptor } from './common/interceptor/transform.interceptor'
import { BaseExceptionsFilter } from './common/exceptions/base.exceptions.filter'
import { HttpExceptionsFilter } from './common/exceptions/http.exceptions.filter'
import { MeetingRoomModule } from './resource/meeting-room/meeting-room.module'
import { MeetingRoom } from './resource/meeting-room/entities/meeting-room.entity'
import { EquipmentModule } from './resource/equipment/equipment.module'
import { Equipment } from './resource/equipment/entities/equipment.entity'
import { LocationModule } from './resource/location/location.module'
import { Location } from './resource/location/entities/location.entity'
import { BookingModule } from './resource/booking/booking.module'
import { Booking } from './resource/booking/entities/booking.entity'
import { StatisticModule } from './resource/statistic/statistic.module'

@Module({
  imports: [
    // 引入全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    // 引入日志
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          transports: [
            new winston.transports.DailyRotateFile({
              level: 'info',
              dirname: configService.get('winston_info_dir'),
              filename: '%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: configService.get('winston_max_sizes'),
              maxFiles: configService.get('winston_max_files'),
              format: winston.format.combine(
                winston.format.timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.json(),
              ),
            }),
            new winston.transports.DailyRotateFile({
              level: 'error',
              dirname: configService.get('winston_error_dir'),
              filename: '%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: configService.get('winston_max_sizes'),
              maxFiles: configService.get('winston_max_files'),
              format: winston.format.combine(
                winston.format.timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.json(),
              ),
            }),
          ],
        }
      },
    }),
    // 引入 jwt
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: configService.get('jwt_access_exp'),
          },
        }
      },
    }),
    // 引入 TypeOrm
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          poolSize: configService.get('mysql_server_pool_size'),
          connectorPackage: 'mysql2',
          synchronize: true,
          logging: true,
          entities: [
            User,
            Role,
            Permission,
            MeetingRoom,
            Equipment,
            Location,
            Booking,
          ],
          extra: {
            authPlugin: 'sha256_password',
          },
        }
      },
    }),
    UserModule,
    RedisModule,
    CaptchaModule,
    AuthModule,
    MeetingRoomModule,
    EquipmentModule,
    LocationModule,
    BookingModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: BaseExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
