import type { ReactNode } from 'react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { getMessages } from '@/lib/i18n/server';

export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { m } = await getMessages();
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{m.skip}</a>
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <PublicFooter />
    </div>
  );
}
