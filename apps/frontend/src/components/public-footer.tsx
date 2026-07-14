import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <p>Teralya · Marketplace europeo de bodegas fundadoras</p>
      <nav aria-label="Navegación del pie">
        <Link href="/vinos">Explorar vinos</Link>
        <Link href="/bodegas">Conocer bodegas</Link>
      </nav>
    </footer>
  );
}
