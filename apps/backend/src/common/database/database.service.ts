import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({ connectionString: configService.get<string>('DATABASE_URL') });
  }

  async query<T extends QueryResultRow>(text: string, params: readonly unknown[] = []): Promise<T[]> {
    const result = await this.pool.query<T>(text, params as unknown[]);
    return result.rows;
  }

  async withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
