import Link from 'next/link';
import { CartLink } from '@/components/cart-link';
import { LanguageSelector } from '@/components/language-selector';
import { readSessionIdentity } from '@/lib/session/session';

const navigation = [
  { href: '/vinos', label: 'Vinos' },
  { href: '/bodegas', label: 'Bodegas' },
] as const;

function NavigationLinks({ buyerAuthenticated }: { buyerAuthenticated: boolean }) {
  return <>
    {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    <CartLink buyerAuthenticated={buyerAuthenticated} />
    <Link href="/acceso">Acceder</Link>
  </>;
}

export async function PublicHeader() {
  const identity = await readSessionIdentity();
  const buyerAuthenticated = identity?.rol === 'comprador';
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="Teralya, inicio">Teralya</Link>
    <div className="header-actions">
      <nav className="desktop-navigation" aria-label="Navegación principal"><NavigationLinks buyerAuthenticated={buyerAuthenticated} /></nav>
      <LanguageSelector />
      <details className="mobile-navigation">
        <summary aria-label="Abrir navegación">Menú</summary>
        <nav aria-label="Navegación principal móvil"><NavigationLinks buyerAuthenticated={buyerAuthenticated} /></nav>
      </details>
    </div>
  </header>;
}
