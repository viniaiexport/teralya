import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from '../cache/redis.service.js';

/** TAPI-01: sesión Bearer opaca de 256 bits, TTL absoluto de 8 horas, sin refresh ni sliding expiration. */
export const SESSION_TOKEN_BYTES = 32;
export const SESSION_TTL_SECONDS = 28_800;
const SESSION_KEY_PREFIX = 'session:';
const SESSION_INDEX_PREFIX = 'session-index:';
const SESSION_BLOCK_PREFIX = 'session-block:';
const SESSION_BLOCK_TTL_SECONDS = 30;
const SESSION_BLOCK_WAIT_MILLISECONDS = 30_000;
const SESSION_BLOCK_RETRY_MILLISECONDS = 25;

const ISSUE_SCRIPT = `
local block_owner = redis.call('GET', KEYS[3])
if block_owner and block_owner ~= ARGV[4] then
  return 0
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
redis.call('SADD', KEYS[2], ARGV[3])
redis.call('EXPIRE', KEYS[2], ARGV[2])
return 1
`;

const RELEASE_BLOCK_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export interface SessionSubject {
  usuarioId: string;
  rol: 'comprador' | 'bodega' | 'administrador';
  bodegaId?: string;
}

export interface SessionActor extends SessionSubject {
  issuedAt: Date;
  expiresAt: Date;
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

function sessionBlockKey(usuarioId: string): string {
  return `${SESSION_BLOCK_PREFIX}${usuarioId}`;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async issue(subject: SessionSubject, blockOwner = ''): Promise<IssuedSession> {
    const token = base64UrlNoPadding(randomBytes(SESSION_TOKEN_BYTES));
    const tokenHash = hashToken(token);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_SECONDS * 1000);
    const payload = JSON.stringify({
      usuario_id: subject.usuarioId,
      rol: subject.rol,
      ...(subject.bodegaId === undefined ? {} : { bodega_id: subject.bodegaId }),
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    const issued = Number(
      await this.redisService.client.eval(
        ISSUE_SCRIPT,
        3,
        `${SESSION_KEY_PREFIX}${tokenHash}`,
        sessionIndexKey(subject.usuarioId),
        sessionBlockKey(subject.usuarioId),
        payload,
        SESSION_TTL_SECONDS.toString(),
        tokenHash,
        blockOwner,
      ),
    );

    if (issued !== 1) {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'No se puede emitir una sesión durante una operación de seguridad.',
      });
    }

    return { accessToken: token, expiresIn: SESSION_TTL_SECONDS, expiresAt };
  }

  async resolve(accessToken: string): Promise<SessionActor | null> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(accessToken)) {
      return null;
    }

    const tokenHash = hashToken(accessToken);
    const key = `${SESSION_KEY_PREFIX}${tokenHash}`;
    const raw = await this.redisService.client.get(key);
    if (raw === null) {
      return null;
    }

    const actor = this.parseActor(raw);
    if (actor === null || actor.expiresAt.getTime() <= Date.now()) {
      await this.redisService.client.del(key);
      return null;
    }

    return actor;
  }

  async withIssuanceBlocked<T>(usuarioId: string, operation: (blockOwner: string) => Promise<T>): Promise<T> {
    const key = sessionBlockKey(usuarioId);
    const owner = randomUUID();
    const deadline = Date.now() + SESSION_BLOCK_WAIT_MILLISECONDS;
    let acquired: string | null = null;

    do {
      acquired = await this.redisService.client.set(
        key,
        owner,
        'EX',
        SESSION_BLOCK_TTL_SECONDS,
        'NX',
      );
      if (acquired === 'OK') {
        break;
      }
      await delay(SESSION_BLOCK_RETRY_MILLISECONDS);
    } while (Date.now() < deadline);

    if (acquired !== 'OK') {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'No se pudo completar la operación de seguridad.',
      });
    }

    try {
      return await operation(owner);
    } finally {
      await this.redisService.client.eval(RELEASE_BLOCK_SCRIPT, 1, key, owner);
    }
  }

  async revokeAllForUser(usuarioId: string): Promise<void> {
    const indexKey = sessionIndexKey(usuarioId);
    const tokenHashes = await this.redisService.client.smembers(indexKey);
    const transaction = this.redisService.client.multi();

    for (const hash of tokenHashes) {
      transaction.del(`${SESSION_KEY_PREFIX}${hash}`);
    }
    transaction.del(indexKey);

    const result = await transaction.exec();
    if (result === null || result.some(([error]) => error !== null)) {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'No se pudieron revocar las sesiones activas.',
      });
    }
  }

  private parseActor(raw: string): SessionActor | null {
    try {
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null) {
        return null;
      }
      const record = value as Record<string, unknown>;
      const rol = record.rol;
      const bodegaId = record.bodega_id;
      const issuedAt = new Date(String(record.issued_at));
      const expiresAt = new Date(String(record.expires_at));
      if (
        typeof record.usuario_id !== 'string' ||
        !['comprador', 'bodega', 'administrador'].includes(String(rol)) ||
        (bodegaId !== undefined && typeof bodegaId !== 'string') ||
        Number.isNaN(issuedAt.getTime()) ||
        Number.isNaN(expiresAt.getTime())
      ) {
        return null;
      }
      if (rol === 'bodega' && typeof bodegaId !== 'string') {
        return null;
      }

      return {
        usuarioId: record.usuario_id,
        rol: rol as SessionActor['rol'],
        ...(typeof bodegaId === 'string' ? { bodegaId } : {}),
        issuedAt,
        expiresAt,
      };
    } catch {
      return null;
    }
  }
}
