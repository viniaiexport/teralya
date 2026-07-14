import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service.js';

/** TAPI-01: sesión Bearer opaca de 256 bits, TTL absoluto de 8 horas, sin refresh ni sliding expiration. */
export const SESSION_TOKEN_BYTES = 32;
export const SESSION_TTL_SECONDS = 28_800;
const SESSION_KEY_PREFIX = 'session:';
const SESSION_INDEX_PREFIX = 'session-index:';

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

function sessionIndexKey(usuarioId: string): string {
  return `${SESSION_INDEX_PREFIX}${usuarioId}`;
}

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async issue(subject: SessionSubject): Promise<IssuedSession> {
    const token = base64UrlNoPadding(randomBytes(SESSION_TOKEN_BYTES));
    const tokenHash = hashToken(token);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_SECONDS * 1000);

    await this.redisService.client.set(
      `${SESSION_KEY_PREFIX}${tokenHash}`,
      JSON.stringify({
        usuario_id: subject.usuarioId,
        rol: subject.rol,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      }),
      'EX',
      SESSION_TTL_SECONDS,
    );

    // Índice inverso (sin usar KEYS en producción) para poder revocar todas las
    // sesiones de un usuario, p. ej. tras un restablecimiento de contraseña (TAPI-01).
    const indexKey = sessionIndexKey(subject.usuarioId);
    await this.redisService.client.sadd(indexKey, tokenHash);
    await this.redisService.client.expire(indexKey, SESSION_TTL_SECONDS);

    return { accessToken: token, expiresIn: SESSION_TTL_SECONDS, expiresAt };
  }

  /**
   * Revoca todas las sesiones activas de un usuario. No afecta a otros usuarios.
   * No usa `KEYS`: recorre únicamente el índice propio del usuario.
   */
  async revokeAllForUser(usuarioId: string): Promise<void> {
    const indexKey = sessionIndexKey(usuarioId);
    const tokenHashes = await this.redisService.client.smembers(indexKey);

    if (tokenHashes.length > 0) {
      const sessionKeys = tokenHashes.map((hash) => `${SESSION_KEY_PREFIX}${hash}`);
      await this.redisService.client.del(...sessionKeys);
    }
    await this.redisService.client.del(indexKey);
  }
}
