import Image from 'next/image';
import Link from 'next/link';
import { catalogFiltersFromSearch, catalogHref, formatEuro, getCatalog, wineHref, type CatalogFilters, type PageWineSummary } from '@/lib/api/catalog';
import { ApiProblem } from '@/lib/api/problem';

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

function Filters({ filters }: { filters: CatalogFilters }) {
  return <form action="/vinos" className="catalog-filters" method="get">
    <div className="field field-wide"><label htmlFor="q">Buscar vino o bodega</label><input defaultValue={filters.q} id="q" maxLength={120} name="q" placeholder="Ej. Rioja reserva"/></div>
    <div className="field"><label htmlFor="tipo_vino">Tipo de vino</label><input defaultValue={filters.tipo_vino} id="tipo_vino" maxLength={80} name="tipo_vino" placeholder="Tinto, blanco…"/></div>
    <div className="field"><label htmlFor="region">Región</label><input defaultValue={filters.region} id="region" maxLength={160} name="region" placeholder="Rioja"/></div>
    <div className="field"><label htmlFor="denominacion_origen">Denominación de origen</label><input defaultValue={filters.denominacion_origen} id="denominacion_origen" maxLength={160} name="denominacion_origen"/></div>
    <div className="field"><label htmlFor="precio_min">Precio mínimo</label><input defaultValue={filters.precio_min} id="precio_min" inputMode="decimal" name="precio_min" pattern="(0|[1-9][0-9]{0,7})\.[0-9]{2}" placeholder="10.00"/></div>
    <div className="field"><label htmlFor="precio_max">Precio máximo</label><input defaultValue={filters.precio_max} id="precio_max" inputMode="decimal" name="precio_max" pattern="(0|[1-9][0-9]{0,7})\.[0-9]{2}" placeholder="50.00"/></div>
    <div className="filter-actions"><button className="button primary" type="submit">Aplicar filtros</button><Link className="button secondary" href="/vinos">Limpiar</Link></div>
  </form>;
}

function Card({ wine }: { wine: PageWineSummary['items'][number] }) {
  const href = wineHref(wine.id);
  const location = [wine.region, wine.denominacion_origen].filter(Boolean).join(' · ');
  return <article className="wine-card">
    <Link aria-label={`Ver ${wine.nombre_comercial}`} className="wine-card-image" href={href}>{wine.imagen_principal === undefined ? <span aria-hidden="true" className="image-placeholder">T</span> : <Image alt={wine.imagen_principal.alt_text} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" src={wine.imagen_principal.url} unoptimized/>}</Link>
    <div className="wine-card-body"><p className="card-kicker">{wine.tipo_vino ?? 'Vino de bodega'}</p><h2><Link href={href}>{wine.nombre_comercial}</Link></h2><p className="winery-name">{wine.bodega.nombre_comercial}</p>{location !== '' && <p className="card-meta">{location}</p>}<div className="wine-card-footer"><strong>{formatEuro(wine.precio)}</strong><Link className="detail-link" href={href}>Ver vino <span aria-hidden="true">→</span></Link></div></div>
  </article>;
}

function Failure({ problem }: { problem?: ApiProblem }) {
  return <section className="catalog-message" role="alert"><h2>No hemos podido cargar los vinos</h2><p>Inténtalo de nuevo dentro de unos instantes.</p>{problem !== undefined && <p className="request-reference">Referencia: {problem.problem.request_id}</p>}</section>;
}

export default async function WinesPage({ searchParams }: Props) {
  const filters = catalogFiltersFromSearch(await searchParams);
  let result: PageWineSummary;
  try {
    result = await getCatalog(filters);
  } catch (error) {
    return <div className="catalog-page premium-catalog-page"><header className="catalog-heading editorial-heading"><p className="eyebrow">Selección Teralya</p><h1>Vinos con origen.</h1><p>Una colección europea vendida directamente por sus bodegas.</p></header><div className="catalog-workspace"><aside className="catalog-filter-panel"><p className="card-kicker">Filtrar selección</p><Filters filters={filters}/></aside><div className="catalog-results"><Failure problem={error instanceof ApiProblem ? error : undefined}/></div></div></div>;
  }
  return <div className="catalog-page premium-catalog-page">
    <header className="catalog-heading editorial-heading"><p className="eyebrow">Selección Teralya</p><h1>Vinos con origen</h1><p>Vinos europeos vendidos y enviados directamente por sus bodegas.</p></header>
    <div className="catalog-workspace">
      <aside className="catalog-filter-panel"><p className="card-kicker">Filtrar selección</p><Filters filters={filters}/></aside>
      <div className="catalog-results"><div aria-live="polite" className="catalog-summary"><p>{result.total_items === 1 ? '1 vino encontrado' : `${result.total_items} vinos encontrados`}</p></div>{result.items.length === 0 ? <section className="catalog-message"><h2>No hay vinos con estos filtros</h2><p>Prueba ampliando la búsqueda o eliminando algún filtro.</p><Link className="button secondary" href="/vinos">Ver todo el catálogo</Link></section> : <section aria-label="Resultados del catálogo" className="wine-grid">{result.items.map((wine) => <Card key={wine.id} wine={wine}/>)}</section>}{result.total_pages > 1 && <nav aria-label="Paginación del catálogo" className="pagination">{result.page > 1 ? <Link href={catalogHref(filters, result.page - 1)} rel="prev">← Anterior</Link> : <span aria-disabled="true">← Anterior</span>}<span>Página {result.page} de {result.total_pages}</span>{result.page < result.total_pages ? <Link href={catalogHref(filters, result.page + 1)} rel="next">Siguiente →</Link> : <span aria-disabled="true">Siguiente →</span>}</nav>}</div>
    </div>
  </div>;
}
