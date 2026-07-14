import { describe, expect, it } from 'vitest';
import { resolveLocale } from '../src/lib/i18n/config';

describe('resolveLocale', () => {
  it('elige el primer idioma compatible y usa español por defecto', () => {
    expect(resolveLocale('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
    expect(resolveLocale('pt-BR')).toBe('es');
    expect(resolveLocale(null)).toBe('es');
  });
});
