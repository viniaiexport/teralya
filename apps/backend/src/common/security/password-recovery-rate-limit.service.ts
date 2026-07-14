import { createHash } from 'node:crypto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../cache/redis.service.js';

const CONSUME_SCRIPT = `
local attempts = redis.call('INCR', KEYS[1])
if attempts == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return attempts
`;

@Injectable()
export class PasswordRecoveryRateLimitService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async consume(email: string): Promise<void> {
    const emailHash = createHash('sha256').update(email).digest('hex');
    const key = `password-recovery-rate:${emailHash}`;
    const windowSeconds = this.configService.getOrThrow<number>(
      'PASSWORD_RECOVERY_RATE_LIMIT_WINDOW_SECONDS',
    );
    const maxAttempts = this.configService.getOrThrow<number>(
      'PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS',
    );
    const attempts = Number(
      await this.redisService.client.eval(CONSUME_SCRIPT, 1, key, windowSeconds.toString()),
    );

    if (attempts > maxAttempts) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
