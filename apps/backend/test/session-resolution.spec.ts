import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { RedisService } from '../src/common/cache/redis.service.js';
import { SessionService } from '../src/common/security/session.service.js';

const TOKEN = 'B'.repeat(43);
const KEY = `session:${createHash('sha256').update(TOKEN).digest('hex')}`;

function serviceWith(raw: string | null): { service: SessionService; get: ReturnType<typeof vi.fn>; del: ReturnType<typeof vi.fn> } {
  const get = vi.fn().mockResolvedValue(raw);
  const del = vi.fn().mockResolvedValue(1);
  const redis = { client: { get, del } } as unknown as RedisService;
  return { service: new SessionService(redis), get, del };
}

describe('SessionService.resolve', () => {
  it('resuelve el actor asociado sin exponer ni almacenar el token', async () => {
    const payload = JSON.stringify({
      usuario_id: 'usuario-1',
      rol: 'bodega',
      bodega_id: 'bodega-1',
      issued_at: '2026-07-14T08:00:00.000Z',
      expires_at: '2099-07-14T16:00:00.000Z',
    });
    const { service, get, del } = serviceWith(payload);

    await expect(service.resolve(TOKEN)).resolves.toMatchObject({
      usuarioId: 'usuario-1',
      rol: 'bodega',
      bodegaId: 'bodega-1',
    });
    expect(get).toHaveBeenCalledWith(KEY);
    expect(del).not.toHaveBeenCalled();
  });

  it('trata una clave ausente como sesión revocada', async () => {
    const { service, del } = serviceWith(null);
    await expect(service.resolve(TOKEN)).resolves.toBeNull();
    expect(del).not.toHaveBeenCalled();
  });

  it.each([
    ['payload corrupto', '{'],
    ['rol desconocido', JSON.stringify({ usuario_id: 'u', rol: 'root', issued_at: '2026-01-01', expires_at: '2099-01-01' })],
    ['bodega sin asociación', JSON.stringify({ usuario_id: 'u', rol: 'bodega', issued_at: '2026-01-01', expires_at: '2099-01-01' })],
    ['sesión expirada', JSON.stringify({ usuario_id: 'u', rol: 'comprador', issued_at: '2020-01-01', expires_at: '2020-01-02' })],
  ])('elimina y rechaza %s', async (_label, raw) => {
    const { service, del } = serviceWith(raw);
    await expect(service.resolve(TOKEN)).resolves.toBeNull();
    expect(del).toHaveBeenCalledWith(KEY);
  });

  it('rechaza tokens no canónicos sin consultar Redis', async () => {
    const { service, get } = serviceWith(null);
    await expect(service.resolve('token-corto')).resolves.toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
});
