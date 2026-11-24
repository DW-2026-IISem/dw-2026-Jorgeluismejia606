import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('LecturaAbierta API')
    .setDescription(
      'Backend REST para la Red de Bibliotecas LecturaAbierta. ' +
        'Los endpoints de negocio exponen 4 niveles de acceso: público, ' +
        'autenticación básica (x-api-key), JWT Bearer + Refresh y JWT + RBAC.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
