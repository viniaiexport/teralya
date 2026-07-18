import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-intro"><Link aria-label="Teralya, inicio" className="footer-brand" href="/"><BrandLogo/></Link><p>Conectamos amantes del vino con bodegas europeas que elaboran con identidad. El comprador compra directamente a cada bodega.</p></div>
      <nav aria-label="Navegación del pie" className="footer-nav-groups">
        <section><h2>Descubrir</h2><div className="footer-link-list"><Link href="/vinos">Explorar vinos</Link><Link href="/bodegas">Conocer bodegas</Link><Link href="/registro/bodega">Acceso profesional</Link></div></section>
        <section><h2>Información</h2><div className="footer-link-list"><Link href="/legal/terminos">Términos y Condiciones</Link><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/cookies">Cookies</Link></div></section>
      </nav>
      <small className="footer-note">© 2026 Teralya. Marketplace europeo de venta directa de bodega a consumidor.</small>
    </footer>
  );
}
