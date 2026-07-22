import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { getCatalog, formatEuro, wineHref, type WineSummary } from '@/lib/api/catalog';
import { getMessages } from '@/lib/i18n/server';
import type { messages } from '@/lib/i18n/messages';

type M = (typeof messages)['es'];
function RecommendedWine({ wine, m }: Readonly<{ wine: WineSummary; m: M }>) {
  const origin = [wine.region, wine.denominacion_origen].filter(Boolean).join(' · ');
  return <article className="recommended-wine-card">
    <Link aria-label={`Ver ${wine.nombre_comercial}`} className="recommended-wine-image" href={wineHref(wine.id)}>
      {wine.imagen_principal === undefined
        ? <span aria-hidden="true" className="recommended-bottle"><i>T</i></span>
        : <Image alt={wine.imagen_principal.alt_text} fill sizes="(max-width: 700px) 82vw, (max-width: 1100px) 42vw, 22vw" src={wine.imagen_principal.url} unoptimized/>}
      <span className="recommended-badge">{m.recommendedBadge}</span>
    </Link>
    <div className="recommended-wine-copy">
      <p className="card-kicker">{wine.tipo_vino ?? m.teralyaSelection}</p>
      <h3><Link href={wineHref(wine.id)}>{wine.nombre_comercial}</Link></h3>
      <p>{wine.bodega.nombre_comercial}</p>
      {origin !== '' && <p className="recommended-origin">{origin}{wine.anada === undefined ? '' : ` · ${wine.anada}`}</p>}
      <div><strong>{formatEuro(wine.precio)}</strong><Link className="detail-link" href={wineHref(wine.id)}>{m.seeWine} <span aria-hidden="true">→</span></Link></div>
    </div>
  </article>;
}

export default async function HomePage() {
  const { m } = await getMessages();
  let recommended: WineSummary[] = [];
  try {
    recommended = (await getCatalog({ page_size: 4 })).items.slice(0, 4);
  } catch {
    // La portada sigue operativa si el catálogo aún no está disponible.
  }

  return <div className="home-page warm-home">
    <section aria-labelledby="hero-title" className="warm-hero">
      <div className="warm-hero-overlay"/>
      <div className="warm-hero-copy">
        <p className="eyebrow">{m.heroEyebrow}</p>
        <h1 id="hero-title">{m.heroTitle}<br/><em>{m.heroEm}</em></h1>
        <p>{m.heroCopy}</p>
        <div className="hero-actions"><Link className="button primary" href="/vinos">{m.discoverWines}</Link><Link className="button hero-ghost" href="/bodegas">{m.meetWineries}</Link></div>
      </div>
      <div className="warm-hero-note"><span>01</span><p><strong>{m.originTable}</strong>{m.originTableCopy}</p></div>
    </section>

    <section aria-label={m.advantages} className="warm-trust-strip">
      <article><span aria-hidden="true">⌂</span><div><strong>{m.direct}</strong><p>{m.directCopy}</p></div></article>
      <article><span aria-hidden="true">◇</span><div><strong>{m.european}</strong><p>{m.europeanCopy}</p></div></article>
      <article><span aria-hidden="true">□</span><div><strong>{m.delivery}</strong><p>{m.deliveryCopy}</p></div></article>
      <article><span aria-hidden="true">✓</span><div><strong>{m.protected}</strong><p>{m.protectedCopy}</p></div></article>
    </section>

    {recommended.length > 0 && <section aria-labelledby="recommended-title" className="recommended-section">
      <header><div><p className="eyebrow">{m.selection}</p><h2 id="recommended-title">{m.recommended}</h2></div><Link className="detail-link" href="/vinos">{m.seeAll} <span aria-hidden="true">→</span></Link></header>
      <div className="recommended-grid">{recommended.map((wine) => <RecommendedWine key={wine.id} wine={wine} m={m}/>)}</div>
    </section>}

    <section aria-labelledby="story-title" className="warm-story">
      <div className="warm-story-image" role="img" aria-label={m.womanWine}><span>{m.personal}<br/>{m.special}</span></div>
      <div className="warm-story-copy"><p className="eyebrow">{m.closer}</p><h2 id="story-title">{m.storyTitle}<br/><em>{m.storyEm}</em></h2><p>{m.storyCopy}</p><Link className="button secondary" href="/bodegas">{m.meetWineries}</Link></div>
    </section>

    <section aria-labelledby="winery-invite-title" className="premium-winery-invite warm-winery-invite">
      <div><p className="eyebrow">{m.makeWine}</p><h2 id="winery-invite-title">{m.joinTitle}</h2><p>{m.joinCopy}</p></div>
      <Link className="button primary" href={'/para-bodegas' as Route}>{m.forWineries}</Link>
    </section>
  </div>;
}
