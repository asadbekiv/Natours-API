import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  // rawBody lets the Stripe webhook verify the signature against the exact bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  // Security headers + CORS. CORS_ORIGIN is a comma-separated allowlist;
  // if unset, reflect the request origin (fine for dev, tighten before launch).
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN')?.split(',') ?? true,
    credentials: true,
  });

  // Routes become /api/v1/<resource> to match the existing Express API.
  // /docs is excluded so the Swagger UI sits at the root.
  app.setGlobalPrefix('api', { exclude: ['docs', 'docs/(.*)'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // OpenAPI / Swagger UI at /docs (interactive contract for the mobile app).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Natours API')
    .setDescription('NestJS port of the Natours tour-booking API.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .addTag('tours')
    .addTag('reviews')
    .addTag('bookings')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Nest API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
