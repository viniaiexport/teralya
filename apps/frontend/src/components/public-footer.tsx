import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <p>Teralya · Marketplace europeo de bodegas fundadoras</p>
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
