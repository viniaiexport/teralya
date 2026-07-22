import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, resolveLocale, type Locale } from './config';
import { messages } from './messages';

export const localeCookie = 'teralya_locale';

export async function getLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get(localeCookie)?.value;
  if (cookieValue !== undefined && isLocale(cookieValue)) return cookieValue;
  return resolveLocale((await headers()).get('accept-language')) ?? defaultLocale;
}

export async function getMessages() {
  const locale = await getLocale();
  return { locale, m: messages[locale] };
}
