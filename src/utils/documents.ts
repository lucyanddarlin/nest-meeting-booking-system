import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as packageConfig from '../../package.json'

export const setupDocument = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle(packageConfig.name)
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    .addBasicAuth({
      type: 'http',
      name: 'jwt',
      description: 'bearer',
    })
    .build()

  const document = SwaggerModule.createDocument(app, options)

  SwaggerModule.setup('api/doc', app, document)
}
