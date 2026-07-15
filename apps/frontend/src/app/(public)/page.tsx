import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">Vino europeo, directamente desde su origen</p>
          <h1 id="hero-title">Descubre las bodegas que están construyendo Teralya.</h1>
          <p className="hero-copy">Vinos con identidad, elaborados por productores que conocen cada parcela y enviados desde la bodega.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/vinos">Explorar vinos</Link>
            <Link className="button secondary" href="/bodegas">Conocer las bodegas</Link>
          </div>
        </div>
        <div aria-hidden="true" className="hero-art">
          <span className="hero-art-sun" />
          <span className="hero-art-hill hero-art-hill-one" />
          <span className="hero-art-hill hero-art-hill-two" />
          <span className="hero-art-bottle" />
          <p>Europa<br/><strong>en cada botella</strong></p>
        </div>
      </section>

      <section className="home-manifesto" aria-labelledby="manifesto-title">
        <p className="eyebrow">Una forma más cercana de elegir vino</p>
        <h2 id="manifesto-title">Menos ruido. Más origen.</h2>
        <p>Una selección que pone delante a la bodega, el territorio y la historia detrás de cada vino.</p>
      </section>

      <section className="home-paths" aria-label="Explorar Teralya">
        <Link className="home-path home-path-wines" href="/vinos">
          <span>01</span><p className="eyebrow">La selección</p><h2>Vinos para descubrir sin prisa</h2><strong>Explorar vinos →</strong>
        </Link>
        <Link className="home-path home-path-wineries" href="/bodegas">
          <span>02</span><p className="eyebrow">Los productores</p><h2>Bodegas con una historia que contar</h2><strong>Conocer bodegas →</strong>
        </Link>
      </section>

      <section className="home-values" aria-label="Principios de la selección">
        <article><span>Origen</span><h3>Directo de bodega</h3><p>Cada productor presenta y envía sus propios vinos.</p></article>
        <article><span>Criterio</span><h3>Una selección legible</h3><p>Información clara para entender qué hay detrás de cada botella.</p></article>
        <article><span>Europa</span><h3>Territorios diversos</h3><p>Regiones, variedades y maneras de elaborar que merecen ser conocidas.</p></article>
      </section>
    </div>
  );
}
