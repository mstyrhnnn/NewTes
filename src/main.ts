import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { SwaggerConfig } from './config/docs/swagger.config';
import { ValidateInputPipe } from './config/pipe/validate.pipe';
import * as firebase from 'firebase-admin';
import { firebaseParams } from './modules/firebase/config/firebase.params';
import { VersioningType } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './config/catch/sentry.catch';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger configuration
  SwaggerConfig.config(app);

  // DTO validation pipe configuration
  app.useGlobalPipes(new ValidateInputPipe());

  // CORS
  app.enableCors();

  // Setup firebase admin
  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseParams),
  });

  // Sentry Init
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });

  // Import the filter globally, capturing all exceptions on all routes
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
