import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('../src/lib/session/session',()=>({readSessionIdentity:vi.fn(async()=>undefined)}));
vi.mock('../src/lib/i18n/server', async () => {
  const { messages } = await import('../src/lib/i18n/messages');
  return { getMessages: vi.fn(async () => ({ locale: 'es', m: messages.es })), getLocale: vi.fn(async () => 'es') };
});
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
import { LanguageSelector } from '@/components/language-selector';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { ScreenState } from '@/components/screen-state';
import { readSessionIdentity } from '@/lib/session/session';

describe('public layout components', () => {
  beforeEach(() => vi.mocked(readSessionIdentity).mockResolvedValue(undefined));

  it('exposes the public navigation for desktop and mobile', async () => {
    const html = renderToStaticMarkup(await PublicHeader());

    expect(html).toContain('aria-label="Navegación principal"');
    expect(html.match(/aria-label="Navegación principal"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('href="/vinos"');
    expect(html).toContain('href="/bodegas"');
    expect(html).toContain('href="/acceso"');
    expect(html).toContain('href="/carrito"');
  });

  it('replaces access with the destination for the authenticated role', async () => {
    vi.mocked(readSessionIdentity).mockResolvedValue({ usuario_id: 'buyer-id', rol: 'comprador' });
    const buyerHtml = renderToStaticMarkup(await PublicHeader());
    expect(buyerHtml).toContain('href="/cuenta"');
    expect(buyerHtml).toContain('Mi cuenta');
    expect(buyerHtml).not.toContain('href="/acceso"');

    vi.mocked(readSessionIdentity).mockResolvedValue({ usuario_id: 'winery-id', rol: 'bodega', bodega_id: 'winery-id' });
    const wineryHtml = renderToStaticMarkup(await PublicHeader());
    expect(wineryHtml).toContain('href="/bodega"');
    expect(wineryHtml).toContain('Panel de bodega');
    expect(wineryHtml).not.toContain('href="/carrito"');

    vi.mocked(readSessionIdentity).mockResolvedValue({ usuario_id: 'admin-id', rol: 'administrador' });
    const adminHtml = renderToStaticMarkup(await PublicHeader());
    expect(adminHtml).toContain('href="/admin"');
    expect(adminHtml).toContain('Administración');
    expect(adminHtml).not.toContain('href="/carrito"');
  });

  it('offers all eleven launch interface languages', () => {
    const html = renderToStaticMarkup(<LanguageSelector initialLocale="fr" />);

    for (const locale of ['es', 'en', 'fr', 'de', 'it', 'pt', 'el', 'hu', 'ro', 'hr', 'bg']) {
      expect(html).toContain(`value="${locale}"`);
    }
    expect(html).toContain('aria-label="Langue"');
    expect(html).toContain('value="fr" selected=""');
  });

  it('uses live status semantics only for transient or failing states', () => {
    const loading = renderToStaticMarkup(<ScreenState kind="loading">Cargando</ScreenState>);
    const error = renderToStaticMarkup(<ScreenState kind="error">Error</ScreenState>);
    const empty = renderToStaticMarkup(<ScreenState kind="empty">Vacío</ScreenState>);

    expect(loading).toContain('role="status"');
    expect(error).toContain('role="alert"');
    expect(empty).not.toContain('role=');
  });

  it('labels footer navigation independently', async () => {
    expect(renderToStaticMarkup(await PublicFooter())).toContain('aria-label="Navegación principal"');
  });
});
