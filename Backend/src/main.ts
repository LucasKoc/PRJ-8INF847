import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = parseInt(config.get<string>('PORT', '3000'), 10);
  const prefix = config.get<string>('API_PREFIX', 'api');
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:4200');

  app.setGlobalPrefix(prefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.enableCors({
    origin: corsOrigin.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DPSCHECK API')
    .setDescription(
      'Tournament management API for casual League of Legends communities. ' +
        'V1 covers auth, teams, tournaments, and registrations. ' +
        'Bracket system and password reset are planned for V2 — their endpoints return 501.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`DPSCHECK API running on http://localhost:${port}/${prefix}`);
  logger.log(`Swagger docs at http://localhost:${port}/${prefix}/docs`);
}

void bootstrap();
