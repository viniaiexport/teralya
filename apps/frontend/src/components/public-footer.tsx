import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-intro"><Link aria-label="Teralya, inicio" className="footer-brand" href="/"><BrandLogo/></Link><p>Conectamos amantes del vino con bodegas europeas que elaboran con identidad. El comprador compra directamente a cada bodega.</p></div>
      <div className="footer-nav-groups">
        <section><h2>Descubrir</h2><nav aria-label="Descubrir Teralya"><Link href="/vinos">Explorar vinos</Link><Link href="/bodegas">Conocer bodegas</Link><Link href="/registro/bodega">Acceso profesional</Link></nav></section>
        <section><h2>Información</h2><nav aria-label="Información legal"><Link href="/legal/terminos">Términos y Condiciones</Link><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/cookies">Cookies</Link><Link href="/legal/alcohol">Mayoría de edad y alcohol</Link></nav></section>
      </div>
      <small className="footer-note">© 2026 Teralya. Marketplace europeo de venta directa de bodega a consumidor.</small>
    </footer>
  );
}
