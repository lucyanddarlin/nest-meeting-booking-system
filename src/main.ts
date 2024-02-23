import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BaseExceptionsFilter } from './common/exceptions/base.exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionsFilter } from './common/exceptions/http.exceptions.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启动 CORS
  app.enableCors();
  // 全局数据转换
  app.useGlobalInterceptors(new TransformInterceptor());
  // 全局错误处理
  app.useGlobalFilters(new BaseExceptionsFilter(), new HttpExceptionsFilter());
  // 全局 DTO 参数校验
  app.useGlobalPipes(new ValidationPipe());
  // 获取配置项
  const configService = app.get(ConfigService);

  await app.listen(configService.get('nest_server_port'));
}
bootstrap();
