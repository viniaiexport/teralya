import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from './request-id.middleware.js';

interface ExceptionPayload {
  code?: string;
  message?: string | string[];
}

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  request_id: string;
  retryable: boolean;
}

const DEFAULT_CODES: Readonly<Record<number, string>> = {
  400: 'VALIDATION_ERROR',
  401: 'AUTHENTICATION_REQUIRED',
  403: 'FORBIDDEN',
  404: 'RESOURCE_NOT_FOUND',
  409: 'CONFLICT',
  410: 'TOKEN_EXPIRED',
  422: 'UNSUPPORTED_STRIPE_EVENT',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  502: 'UPSTREAM_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

const TITLES: Readonly<Record<number, string>> = {
  400: 'Validation Error',
  401: 'Authentication Required',
  403: 'Forbidden',
  404: 'Resource Not Found',
  409: 'Conflict',
  410: 'Token Expired',
  422: 'Unsupported Stripe Event',
  429: 'Rate Limited',
  500: 'Internal Error',
  502: 'Upstream Error',
  503: 'Service Unavailable',
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = this.payload(exception);
    const code = payload.code ?? DEFAULT_CODES[status] ?? 'HTTP_ERROR';
    const detail = status >= 500 ? 'La solicitud no pudo completarse.' : this.detail(payload);
    const requestId = String(response.getHeader(REQUEST_ID_HEADER));
    const problem: ProblemDetails = {
      type: `https://teralya.es/problems/${code.toLowerCase().replaceAll('_', '-')}`,
      title: TITLES[status] ?? 'HTTP Error',
      status,
      detail,
      instance: request.originalUrl,
      code,
      request_id: requestId,
      retryable: [429, 502, 503].includes(status),
    };

    if (status === 401) {
      response.setHeader('WWW-Authenticate', 'Bearer');
    }
    response.status(status).type('application/problem+json').send(problem);
  }

  private payload(exception: unknown): ExceptionPayload {
    if (!(exception instanceof HttpException)) {
      return {};
    }
    const response = exception.getResponse();
    return typeof response === 'string' ? { message: response } : response;
  }

  private detail(payload: ExceptionPayload): string {
    if (Array.isArray(payload.message)) {
      return payload.message.join('; ');
    }
    return payload.message ?? 'La solicitud no pudo completarse.';
  }
}
