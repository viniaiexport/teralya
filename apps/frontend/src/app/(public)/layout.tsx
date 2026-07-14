import type { ReactNode } from 'react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <PublicFooter />
    </div>
  );
}
