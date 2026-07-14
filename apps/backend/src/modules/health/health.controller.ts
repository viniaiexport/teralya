import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from '../../common/cache/redis.service.js';
import { DatabaseService } from '../../common/database/database.service.js';

const READINESS_TIMEOUT_MS = 1_500;

interface HealthResponse {
  status: 'ok' | 'ready';
  checks?: { database: 'up'; redis: 'up' };
}

function withTimeout<T>(operation: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Readiness check timed out.')), READINESS_TIMEOUT_MS);
    void operation.then(resolve, reject).finally(() => clearTimeout(timeout));
  });
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  live(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<HealthResponse> {
    const checks = await Promise.allSettled([
      withTimeout(this.database.query('SELECT 1')),
      withTimeout(this.redis.client.ping()),
    ]);
    if (checks.some((check) => check.status === 'rejected')) {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Las dependencias del servicio no están disponibles.',
      });
    }
    return { status: 'ready', checks: { database: 'up', redis: 'up' } };
  }
}
