import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger documentation for v1
  const configV1 = new DocumentBuilder()
    .setTitle('Product Price Aggregator API')
    .setDescription('A production-ready Product Price Aggregation service')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('providers', 'Provider management endpoints')
    .addTag('stream', 'Real-time streaming endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [],
  });
  SwaggerModule.setup('api/v1', app, documentV1);

  // Swagger documentation for v2 (future version)
  const configV2 = new DocumentBuilder()
    .setTitle('Product Price Aggregator API')
    .setDescription(
      'A production-ready Product Price Aggregation service - Version 2',
    )
    .setVersion('2.0')
    .addTag('health', 'Health check endpoints')
    .addTag('products', 'Enhanced product management endpoints')
    .addTag('providers', 'Enhanced provider management endpoints')
    .addTag('stream', 'Enhanced real-time streaming endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [],
  });
  SwaggerModule.setup('api/v2', app, documentV2);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation v1: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation v2: http://localhost:${port}/api/v2`);
}
void bootstrap();
