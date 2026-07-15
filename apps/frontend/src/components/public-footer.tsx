import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div><Link className="footer-brand" href="/">Teralya</Link><p>Vinos europeos, directamente desde su origen.</p></div>
      <nav aria-label="Navegación del pie">
        <Link href="/vinos">Explorar vinos</Link>
        <Link href="/bodegas">Conocer bodegas</Link>
        <Link href="/legal/terminos">Términos y Condiciones</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/legal/cookies">Cookies</Link>
      </nav>
    </footer>
  );
}
