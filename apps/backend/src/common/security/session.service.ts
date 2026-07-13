import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service.js';

/** TAPI-01: sesión Bearer opaca de 256 bits, TTL absoluto de 8 horas, sin refresh ni sliding expiration. */
export const SESSION_TOKEN_BYTES = 32;
export const SESSION_TTL_SECONDS = 28_800;
const SESSION_KEY_PREFIX = 'session:';

export interface SessionSubject {
  usuarioId: string;
  rol: 'comprador' | 'bodega' | 'administrador';
}

export interface IssuedSession {
  accessToken: string;
  expiresIn: number;
  expiresAt: Date;
}

function base64UrlNoPadding(buffer: Buffer): string {
  return buffer.toString('base64url');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async issue(subject: SessionSubject): Promise<IssuedSession> {
    const token = base64UrlNoPadding(randomBytes(SESSION_TOKEN_BYTES));
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    await this.redisService.client.set(
      `${SESSION_KEY_PREFIX}${tokenHash}`,
      JSON.stringify({ usuario_id: subject.usuarioId, rol: subject.rol, expires_at: expiresAt.toISOString() }),
      'EX',
      SESSION_TTL_SECONDS,
    );

    return { accessToken: token, expiresIn: SESSION_TTL_SECONDS, expiresAt };
  }
}
