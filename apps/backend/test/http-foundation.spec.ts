import 'reflect-metadata';
import { BadRequestException, Body, Controller, Get, Module, Post, Req, ValidationPipe } from '@nestjs/common';
import { IsString } from 'class-validator';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApplication } from '../src/bootstrap.js';

class ClosedBody {
  @IsString()
  value!: string;
}

@Controller('__test__')
class TestController {
  @Get('problem')
  problem(): never {
    throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Entrada inválida.' });
  }

  @Post('closed-body')
  closedBody(
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, expectedType: ClosedBody }))
    body: ClosedBody,
  ): ClosedBody {
    return body;
  }

  @Post('raw-body')
  rawBody(@Req() requestValue: RawBodyRequest<Request>): { raw: string } {
    return { raw: requestValue.rawBody?.toString('utf8') ?? '' };
  }
}

@Module({ controllers: [TestController] })
class TestModule {}

describe('HTTP foundation', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(TestModule, { rawBody: true, logger: false });
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('generates a UUID request id and returns Problem JSON', async () => {
    const response = await request(app.getHttpServer()).get('/__test__/problem').expect(400);

    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/i);
    expect(response.body).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      detail: 'Entrada inválida.',
      request_id: response.headers['x-request-id'],
      retryable: false,
    });
  });

  it('preserves a valid incoming request id', async () => {
    const requestId = '11111111-1111-4111-8111-111111111111';
    const response = await request(app.getHttpServer())
      .get('/__test__/problem')
      .set('X-Request-Id', requestId)
      .expect(400);

    expect(response.headers['x-request-id']).toBe(requestId);
  });

  it('rejects additional request properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/__test__/closed-body')
      .send({ value: 'válido', extra: 'prohibido' })
      .expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('preserves the raw JSON body required by the Stripe webhook', async () => {
    const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
    const response = await request(app.getHttpServer())
      .post('/__test__/raw-body')
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({ raw: payload });
  });
});
