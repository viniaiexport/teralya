import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem } from '../src/lib/api/problem';

vi.mock('server-only', () => ({}));

afterEach(() => { vi.unstubAllGlobals(); delete process.env.TERALYA_API_URL; });

describe('apiRequest', () => {
  it('envía JSON sin cache y no añade Authorization si no hay sesión', async () => {
    process.env.TERALYA_API_URL = 'https://api.teralya.test/';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { apiRequest } = await import('../src/lib/api/client');
    await expect(apiRequest<{ ok: boolean }>('/vinos')).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.teralya.test/vinos');
    expect(init.cache).toBe('no-store');
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
  });

  it('convierte Problem Details en ApiProblem', async () => {
    process.env.TERALYA_API_URL = 'https://api.teralya.test';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ type:'about:blank',title:'Not Found',status:404,detail:'No existe.',code:'RESOURCE_NOT_FOUND',request_id:'11111111-1111-4111-8111-111111111111',retryable:false }), { status: 404 })));
    const { apiRequest } = await import('../src/lib/api/client');
    await expect(apiRequest('/vinos/11111111-1111-4111-8111-111111111111')).rejects.toBeInstanceOf(ApiProblem);
  });
});
