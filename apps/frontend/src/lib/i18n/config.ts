export const supportedLocales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'el', 'hu', 'ro', 'hr', 'bg'] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = 'es';
export const localeNames: Readonly<Record<Locale, string>> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  el: 'Ελληνικά',
  hu: 'Magyar',
  ro: 'Română',
  hr: 'Hrvatski',
  bg: 'Български',
};

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
