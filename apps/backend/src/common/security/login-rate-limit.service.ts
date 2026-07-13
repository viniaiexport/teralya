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
export class LoginRateLimitService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async consume(email: string): Promise<void> {
    const key = this.key(email);
    const windowSeconds = this.configService.getOrThrow<number>('LOGIN_RATE_LIMIT_WINDOW_SECONDS');
    const maxAttempts = this.configService.getOrThrow<number>('LOGIN_RATE_LIMIT_MAX_ATTEMPTS');
    const attempts = Number(
      await this.redisService.client.eval(CONSUME_SCRIPT, 1, key, windowSeconds.toString()),
    );

    if (attempts > maxAttempts) {
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async reset(email: string): Promise<void> {
    await this.redisService.client.del(this.key(email));
  }

  private key(email: string): string {
    const emailHash = createHash('sha256').update(email).digest('hex');
    return `login-rate:${emailHash}`;
  }
}
