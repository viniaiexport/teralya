import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REQUEST_ID_HEADER = 'X-Request-Id';

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const candidate = request.header(REQUEST_ID_HEADER);
  const requestId = candidate !== undefined && UUID_PATTERN.test(candidate) ? candidate : randomUUID();

  response.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
