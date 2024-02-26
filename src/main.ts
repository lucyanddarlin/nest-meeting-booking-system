import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupDocument } from './utils/documents';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启动 CORS
  app.enableCors();
  // 全局 DTO 参数校验
  app.useGlobalPipes(new ValidationPipe());

  // 启用 swagger 文档
  setupDocument(app);

  await app.listen(app.get(ConfigService).get('nest_server_port'));
}
bootstrap();
