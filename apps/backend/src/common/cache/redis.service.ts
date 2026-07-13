import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis(configService.get<string>('REDIS_URL') as string, { lazyConnect: false });
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
