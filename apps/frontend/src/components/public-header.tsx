import Link from 'next/link';
import { LanguageSelector } from '@/components/language-selector';

const navigation = [
  { href: '/vinos', label: 'Vinos' },
  { href: '/bodegas', label: 'Bodegas' },
  { href: '/acceso', label: 'Acceder' },
] as const;

function NavigationLinks() {
  return (
    <>
      {navigation.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function PublicHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Teralya, inicio">
        Teralya
      </Link>
      <div className="header-actions">
        <nav className="desktop-navigation" aria-label="Navegación principal">
          <NavigationLinks />
        </nav>
        <LanguageSelector />
        <details className="mobile-navigation">
          <summary aria-label="Abrir navegación">Menú</summary>
          <nav aria-label="Navegación principal móvil">
            <NavigationLinks />
          </nav>
        </details>
      </div>
    </header>
  );
}
