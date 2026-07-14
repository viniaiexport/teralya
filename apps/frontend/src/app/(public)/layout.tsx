import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Teralya, inicio">Teralya</Link>
        <nav aria-label="Navegación principal">
          <Link href="/vinos">Vinos</Link>
          <Link href="/bodegas">Bodegas</Link>
          <Link href="/acceso">Acceder</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">Teralya · Marketplace europeo de bodegas fundadoras</footer>
    </div>
  );
}
