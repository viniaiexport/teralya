export const supportedLocales = ['es', 'en', 'fr', 'de', 'it'] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = 'es';

export function isLocale(value: string): value is Locale {
  return supportedLocales.some((locale) => locale === value);
}

export function resolveLocale(acceptLanguage: string | null): Locale {
  if (acceptLanguage === null) return defaultLocale;
  for (const preference of acceptLanguage.split(',')) {
    const language = preference.trim().split(';')[0]?.split('-')[0]?.toLowerCase();
    if (language !== undefined && isLocale(language)) return language;
  }
  return defaultLocale;
}
