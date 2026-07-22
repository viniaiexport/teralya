'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
import { defaultLocale, isLocale, localeNames, type Locale } from '@/lib/i18n/config';
import { messages } from '@/lib/i18n/messages';

const localeCookie = 'teralya_locale';

export function LanguageSelector({ initialLocale = defaultLocale }: Readonly<{ initialLocale?: Locale }>) {
  const [locale, setLocale] = useState(initialLocale);
  const router = useRouter();

  function changeLocale(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    if (!isLocale(nextLocale)) return;

    setLocale(nextLocale);
    document.cookie = `${localeCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLocale;
    router.refresh();
  }

  return (
    <label className="language-selector">
      <span className="visually-hidden">{messages[locale].language}</span>
      <select aria-label={messages[locale].language} value={locale} onChange={changeLocale}>
        {Object.entries(localeNames).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
