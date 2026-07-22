import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { getMessages } from '@/lib/i18n/server';

export async function PublicFooter() {
  const { m } = await getMessages();
  return (
    <footer className="site-footer">
      <div className="footer-intro"><Link aria-label={m.home} className="footer-brand" href="/"><BrandLogo full/></Link><p>{m.footerClaim}</p></div>
      <nav aria-label={m.nav} className="footer-nav-groups">
        <section><h2>{m.explore}</h2><div className="footer-link-list"><Link href="/vinos">{m.discoverWines}</Link><Link href="/bodegas">{m.meetWineries}</Link><Link href="/registro/bodega">{m.forWineries}</Link></div></section>
        <section><h2>{m.legal}</h2><div className="footer-link-list"><Link href="/legal/terminos">{m.terms}</Link><Link href="/legal/privacidad">{m.privacy}</Link><Link href="/legal/cookies">{m.cookies}</Link></div></section>
      </nav>
      <small className="footer-note">© 2026 Teralya. {m.rights}</small>
    </footer>
  );
}
