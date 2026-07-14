import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('../src/lib/session/session',()=>({readSessionIdentity:vi.fn(async()=>undefined)}));
import { LanguageSelector } from '@/components/language-selector';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { ScreenState } from '@/components/screen-state';

describe('public layout components', () => {
  it('exposes the public navigation for desktop and mobile', async () => {
    const html = renderToStaticMarkup(await PublicHeader());

    expect(html).toContain('aria-label="Navegación principal"');
    expect(html).toContain('aria-label="Navegación principal móvil"');
    expect(html).toContain('href="/vinos"');
    expect(html).toContain('href="/bodegas"');
    expect(html).toContain('href="/acceso"');
    expect(html).toContain('href="/carrito"');
  });

  it('offers all five approved interface languages', () => {
    const html = renderToStaticMarkup(<LanguageSelector initialLocale="fr" />);

    for (const locale of ['es', 'en', 'fr', 'de', 'it']) {
      expect(html).toContain(`value="${locale}"`);
    }
    expect(html).toContain('aria-label="Idioma"');
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

  it('labels footer navigation independently', () => {
    expect(renderToStaticMarkup(<PublicFooter />)).toContain('aria-label="Navegación del pie"');
  });
});
