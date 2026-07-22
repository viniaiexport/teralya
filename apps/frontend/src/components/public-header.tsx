import Link from 'next/link';
import type { Route } from 'next';
import { BrandLogo } from '@/components/brand-logo';
import { CartLink } from '@/components/cart-link';
import { LanguageSelector } from '@/components/language-selector';
import { readSessionIdentity, type SessionIdentity } from '@/lib/session/session';
import { getMessages } from '@/lib/i18n/server';
import type { messages } from '@/lib/i18n/messages';

type M = (typeof messages)['es'];

function NavigationLinks({ identity, m }: { identity?: SessionIdentity; m: M }) {
  const navigation = [{href:'/vinos',label:m.wines},{href:'/bodegas',label:m.wineries}] as const;
  const accessDestination = { href: '/acceso', label: m.signIn } as const;
  const privateDestinations = {comprador:{href:'/cuenta',label:m.account},bodega:{href:'/bodega',label:m.wineryPanel},administrador:{href:'/admin',label:m.admin}} as const satisfies Readonly<Record<SessionIdentity['rol'], { href: string; label: string }>>;
  const buyerAuthenticated = identity?.rol === 'comprador';
  const destination = identity === undefined ? accessDestination : privateDestinations[identity.rol];
  return <>
    {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    {identity === undefined && <Link className="professional-link" href={'/para-bodegas' as Route}>{m.wineryAccess}</Link>}
    {(identity === undefined || buyerAuthenticated) && <CartLink buyerAuthenticated={buyerAuthenticated}/>}
    <Link href={destination.href}>{destination.label}</Link>
  </>;
}

export async function PublicHeader() {
  const identity = await readSessionIdentity();
  const { locale, m } = await getMessages();
  return <header className="site-header">
    <Link aria-label={m.home} className="brand" href="/"><BrandLogo/></Link>
    <div className="header-actions">
      <nav aria-label={m.nav} className="desktop-navigation"><NavigationLinks identity={identity} m={m}/></nav>
      <LanguageSelector initialLocale={locale}/>
      <details className="mobile-navigation"><summary aria-label={m.openMenu}>{m.menu}</summary><nav aria-label={m.nav}><NavigationLinks identity={identity} m={m}/></nav></details>
    </div>
  </header>;
}
