import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('HTTP');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const line = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`;
      logger.log(line);
      process.stdout.write(`[HTTP] ${line}\n`);
    });

    next();
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (development only)
  if (process.env['NODE_ENV'] !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('AWS Exam Prep API')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env['PORT'] ?? 3001;
  process.stdout.write('[HTTP] Request logging enabled\n');
  await app.listen(port);
}

void bootstrap();
