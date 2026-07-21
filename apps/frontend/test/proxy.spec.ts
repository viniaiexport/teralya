import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../src/proxy';

describe('private route proxy', () => {
  it.each(['/cuenta', '/pedidos', '/bodega', '/admin'])('redirects unauthenticated %s requests', (path) => {
    const response = proxy(new NextRequest(`https://staging.teralya.eu${path}`));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://staging.teralya.eu/acceso');
  });

  it('lets the signed-cookie session continue to role validation', () => {
    const request = new NextRequest('https://staging.teralya.eu/admin', {
      headers: { cookie: 'teralya_session=token; teralya_identity=identity.signature' },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
