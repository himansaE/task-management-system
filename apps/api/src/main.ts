import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

async function bootstrap() {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    type SwaggerApp = Parameters<typeof SwaggerModule.createDocument>[0];
    const swaggerApp = app as SwaggerApp;

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('Auth and task management API documentation')
      .setVersion('1.0.0')
      .addCookieAuth(
        'access_token',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
        'accessToken',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(
      swaggerApp,
      swaggerConfig,
    );
    SwaggerModule.setup('api/docs', swaggerApp, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  });

  await app.listen(process.env.API_PORT ?? process.env.PORT ?? 3000);
}
bootstrap();
