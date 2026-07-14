import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">Vino europeo, directamente desde su origen</p>
      <h1 id="hero-title">Descubre las bodegas que están construyendo Teralya.</h1>
      <p className="hero-copy">Una selección transparente de vinos con identidad, enviados por cada bodega.</p>
      <div className="hero-actions">
        <Link className="button primary" href="/vinos">Explorar vinos</Link>
        <Link className="button secondary" href="/bodegas">Conocer bodegas</Link>
      </div>
    </section>
  );
}
