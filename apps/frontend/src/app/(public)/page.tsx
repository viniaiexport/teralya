import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page">
      <section aria-labelledby="hero-title" className="premium-hero">
        <div className="premium-hero-copy">
          <p className="eyebrow">El futuro del vino</p>
          <h1 id="hero-title">Descubre las bodegas que están construyendo <span className="brand-gradient">Teralya.</span></h1>
          <p className="hero-copy">Teralya conecta bodegas europeas con personas que buscan vinos auténticos. Sin intermediarios, con información clara y envío desde el origen.</p>
          <div className="premium-hero-actions hero-actions"><Link className="button primary" href="/vinos">Explorar vinos</Link><Link className="button secondary" href="/bodegas">Conocer bodegas</Link></div>
          <div aria-label="Ventajas de Teralya" className="premium-trust-row"><span><strong>Directo de bodega</strong>Compra a quien elabora</span><span><strong>Selección legible</strong>Origen e información clara</span><span><strong>Pago protegido</strong>Checkout seguro con Stripe</span></div>
        </div>
        <div aria-label="Botella de vino europeo frente a un viñedo al atardecer" className="premium-hero-media" role="img"><div className="premium-hero-caption"><strong>Bodega Valdeluz</strong><span>Historia visual de una bodega imaginaria</span></div></div>
      </section>

      <section aria-labelledby="film-title" className="premium-film">
        <div className="premium-film-media">
          <video aria-hidden="true" autoPlay loop muted playsInline poster="https://unsplash.com/photos/27G8PF-fjrs/download?force=true&w=1400" preload="metadata"><source src="https://cdn.coverr.co/videos/coverr-grapevine-in-italy-5448/1080p.mp4" type="video/mp4"/></video>
          <span aria-hidden="true" className="film-play">▶</span>
        </div>
        <div className="premium-film-copy"><p className="eyebrow">Bodega invitada · Historia visual</p><h2 id="film-title">Bodega Valdeluz, una finca imaginaria con alma europea.</h2><p>Una pieza editorial breve para transmitir el cuidado del viñedo, la paciencia de la crianza y la relación directa entre productor y comprador.</p><Link className="detail-link" href="/bodegas">Descubrir bodegas reales →</Link></div>
      </section>

      <section aria-label="Teralya en casa" className="premium-life-grid">
        <article className="premium-life-card premium-life-delivery"><div><p className="eyebrow">Entrega cuidada</p><h2>Tu vino, donde estés.</h2><p>Recíbelo en casa con el embalaje y las condiciones declaradas por cada bodega.</p><Link className="detail-link" href="/vinos">Explorar la selección →</Link></div></article>
        <article className="premium-life-card premium-life-couple"><div><p className="eyebrow">Momentos que importan</p><h2>Brindar también es compartir origen.</h2><p>Una botella puede convertir una cena sencilla en una historia que merece recordarse.</p><Link className="detail-link" href="/bodegas">Conocer a los productores →</Link></div></article>
      </section>

      <section aria-label="Principios de Teralya" className="premium-values">
        <article><span>01 · Origen</span><h3>Directo de bodega</h3><p>Cada productor presenta, vende y envía sus propios vinos.</p></article>
        <article><span>02 · Criterio</span><h3>Selección con contexto</h3><p>Territorio, elaboración y condiciones visibles antes de comprar.</p></article>
        <article><span>03 · Europa</span><h3>Regiones diversas</h3><p>Un catálogo europeo construido bodega a bodega.</p></article>
        <article><span>04 · Confianza</span><h3>Checkout seguro</h3><p>Precios, stock y pedido validados de nuevo antes del pago.</p></article>
      </section>

      <section aria-labelledby="process-title" className="premium-process">
        <header><p className="eyebrow">Cómo funciona</p><h2 id="process-title">De la bodega a tu puerta en cuatro pasos.</h2></header>
        <div className="premium-process-grid"><article><b>1</b><h3>Descubre</h3><p>Explora vinos y bodegas por origen, estilo y precio.</p></article><article><b>2</b><h3>Elige</h3><p>Añade tus botellas y revisa quién vende cada vino.</p></article><article><b>3</b><h3>Compra</h3><p>Confirma tus direcciones y continúa al pago protegido.</p></article><article><b>4</b><h3>Disfruta</h3><p>Recibe el pedido de cada bodega y sigue su estado.</p></article></div>
      </section>
    </div>
  );
}
