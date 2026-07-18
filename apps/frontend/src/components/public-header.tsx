import Link from 'next/link';
import type { Route } from 'next';
import { BrandLogo } from '@/components/brand-logo';
import { CartLink } from '@/components/cart-link';
import { LanguageSelector } from '@/components/language-selector';
import { readSessionIdentity, type SessionIdentity } from '@/lib/session/session';

const navigation = [
  { href: '/vinos', label: 'Vinos' },
  { href: '/bodegas', label: 'Bodegas' },
] as const;

const accessDestination = { href: '/acceso', label: 'Iniciar sesión' } as const;
const privateDestinations = {
  comprador: { href: '/cuenta', label: 'Mi cuenta' },
  bodega: { href: '/bodega', label: 'Mi bodega' },
  administrador: { href: '/admin', label: 'Administración' },
} as const satisfies Readonly<Record<SessionIdentity['rol'], { href: string; label: string }>>;

function NavigationLinks({ identity }: { identity?: SessionIdentity }) {
  const buyerAuthenticated = identity?.rol === 'comprador';
  const destination = identity === undefined ? accessDestination : privateDestinations[identity.rol];
  return <>
    {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    {identity === undefined && <Link className="professional-link" href={'/registro/bodega' as Route}>Soy bodega</Link>}
    {(identity === undefined || buyerAuthenticated) && <CartLink buyerAuthenticated={buyerAuthenticated}/>}
    <Link href={destination.href}>{destination.label}</Link>
  </>;
}

export async function PublicHeader() {
  const identity = await readSessionIdentity();
  return <header className="site-header">
    <Link aria-label="Teralya, inicio" className="brand" href="/"><BrandLogo/></Link>
    <div className="header-actions">
      <nav aria-label="Navegación principal" className="desktop-navigation"><NavigationLinks identity={identity}/></nav>
      <LanguageSelector/>
      <details className="mobile-navigation"><summary aria-label="Abrir navegación">Menú</summary><nav aria-label="Navegación principal móvil"><NavigationLinks identity={identity}/></nav></details>
    </div>
  </header>;
}
