import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ProblemDetailsFilter } from './common/http/problem-details.filter.js';
import { requestIdMiddleware } from './common/http/request-id.middleware.js';

export function configureApplication(app: NestExpressApplication): void {
  app.use(helmet());
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.enableShutdownHooks();
}
