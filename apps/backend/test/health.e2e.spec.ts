import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureApplication } from '../src/bootstrap.js';
import { RedisService } from '../src/common/cache/redis.service.js';
import { DatabaseService } from '../src/common/database/database.service.js';
import { HealthController } from '../src/modules/health/health.controller.js';

const database = { query: vi.fn() };
const redis = { client: { ping: vi.fn() } };

@Module({
  controllers: [HealthController],
  providers: [
    { provide: DatabaseService, useValue: database },
    { provide: RedisService, useValue: redis },
  ],
})
class HealthTestModule {}

async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(HealthTestModule, { logger: false });
  configureApplication(app);
  await app.init();
  return app;
}

describe('health endpoints', () => {
  let app: NestExpressApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
    vi.clearAllMocks();
  });

  it('keeps liveness independent from PostgreSQL and Redis', async () => {
    database.query.mockRejectedValue(new Error('database unavailable'));
    redis.client.ping.mockRejectedValue(new Error('redis unavailable'));
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/health/live').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(database.query).not.toHaveBeenCalled();
    expect(redis.client.ping).not.toHaveBeenCalled();
  });

  it('reports ready only when both dependencies respond', async () => {
    database.query.mockResolvedValue([{ '?column?': 1 }]);
    redis.client.ping.mockResolvedValue('PONG');
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/health/ready').expect(200);

    expect(response.body).toEqual({ status: 'ready', checks: { database: 'up', redis: 'up' } });
    expect(database.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns retryable Problem Details without leaking dependency errors', async () => {
    database.query.mockRejectedValue(new Error('postgresql://secret@database/teralya'));
    redis.client.ping.mockResolvedValue('PONG');
    app = await createApp();

    const response = await request(app.getHttpServer()).get('/health/ready').expect(503);

    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE', retryable: true });
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
});
