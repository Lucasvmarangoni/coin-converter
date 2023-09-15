import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function swagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Currency converter')
    .setDescription('The currency converter API')
    .setVersion('1.0')
    .addTag('user')
    .addTag('auth')
    .addTag('converter')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
