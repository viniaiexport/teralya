import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatEuro, getPublicWinery, wineHref, type BodegaPublic } from '@/lib/api/catalog';
import { ApiProblem } from '@/lib/api/problem';

interface Props { params: Promise<{ id: string }> }

function Failure({ problem }: { problem?: ApiProblem }) {
  return <div className="screen-state"><h1>No hemos podido cargar esta bodega</h1><p>Inténtalo de nuevo dentro de unos instantes.</p>{problem !== undefined && <p className="request-reference">Referencia: {problem.problem.request_id}</p>}<Link className="button secondary" href="/bodegas">Volver a bodegas</Link></div>;
}

function ShippingConditions({ winery }: { winery: BodegaPublic }) {
  const hasConditions = winery.paises_envio !== undefined || winery.plazo_preparacion_dias !== undefined || winery.plazo_entrega_estimado !== undefined || winery.coste_envio_descripcion !== undefined || winery.transportista_habitual !== undefined || winery.restricciones_entrega !== undefined || winery.condiciones_empaquetado !== undefined;
  if (!hasConditions) return null;
  return <section id="condiciones-envio" className="wine-content" aria-labelledby="shipping-title"><div><p className="eyebrow">Información de compra</p><h2 id="shipping-title">Condiciones de envío de la bodega</h2>{winery.coste_envio_descripcion !== undefined && <><h3>Coste</h3><p>{winery.coste_envio_descripcion}</p></>}{winery.restricciones_entrega !== undefined && <><h3>Restricciones</h3><p>{winery.restricciones_entrega}</p></>}{winery.condiciones_empaquetado !== undefined && <><h3>Empaquetado</h3><p>{winery.condiciones_empaquetado}</p></>}</div><aside className="wine-facts"><h2>Plazos y destinos</h2><dl>{winery.paises_envio !== undefined && <div><dt>Países de envío</dt><dd>{winery.paises_envio.join(', ')}</dd></div>}{winery.plazo_preparacion_dias !== undefined && <div><dt>Preparación</dt><dd>{winery.plazo_preparacion_dias} días</dd></div>}{winery.plazo_entrega_estimado !== undefined && <div><dt>Entrega estimada</dt><dd>{winery.plazo_entrega_estimado}</dd></div>}{winery.transportista_habitual !== undefined && <div><dt>Transportista habitual</dt><dd>{winery.transportista_habitual}</dd></div>}</dl></aside></section>;
}

export default async function WineryDetailPage({ params }: Props) {
  const { id } = await params;
  let winery: BodegaPublic;
  try {
    winery = await getPublicWinery(id);
  } catch (error) {
    if (error instanceof ApiProblem && error.problem.status === 404) notFound();
    return <Failure problem={error instanceof ApiProblem ? error : undefined}/>;
  }
  const origin = [winery.region, winery.denominacion_origen, winery.pais].filter(Boolean).join(' · ');
  return <div className="wine-detail winery-detail-page">
    <nav aria-label="Migas de pan" className="breadcrumbs"><Link href="/bodegas">Bodegas</Link><span aria-hidden="true">/</span><span aria-current="page">{winery.nombre_comercial}</span></nav>
    <header className="winery-premium-hero"><p className="eyebrow">Bodega Teralya</p><h1>{winery.nombre_comercial}</h1>{origin !== '' && <p>{origin}</p>}<p>{winery.historia ?? 'Un productor europeo con una manera propia de interpretar el viñedo y cada añada.'}</p><div className="winery-premium-meta">{winery.anio_fundacion !== undefined && <span>Desde {winery.anio_fundacion}</span>}<span>Venta directa</span><span>Condiciones de envío visibles</span></div></header>
    <section aria-labelledby="winery-story-title" className="winery-story-film"><div><p className="eyebrow">Una mirada a la bodega</p><h2 id="winery-story-title">El paisaje, la bodega y las personas detrás de cada botella.</h2><p>{winery.filosofia ?? 'Teralya presenta el origen de cada productor con una narrativa visual coherente y sin ocultar quién vende el vino.'}</p>{winery.web !== undefined && <a className="detail-link" href={winery.web} rel="noreferrer" target="_blank">Visitar la web de la bodega →</a>}</div></section>
    {(winery.historia !== undefined || winery.filosofia !== undefined) && <section className="wine-content"><div>{winery.historia !== undefined && <><p className="eyebrow">Herencia</p><h2>Nuestra historia</h2><p>{winery.historia}</p></>}{winery.filosofia !== undefined && <><h2>Filosofía</h2><p>{winery.filosofia}</p></>}</div><aside className="wine-facts"><h2>Origen</h2><dl>{origin !== '' && <div><dt>Territorio</dt><dd>{origin}</dd></div>}{winery.anio_fundacion !== undefined && <div><dt>Fundación</dt><dd>{winery.anio_fundacion}</dd></div>}</dl></aside></section>}
    <ShippingConditions winery={winery}/>
    <section aria-labelledby="winery-wines-title"><header className="catalog-heading"><p className="eyebrow">Selección disponible</p><h2 id="winery-wines-title">Vinos de {winery.nombre_comercial}</h2></header>{winery.vinos.length === 0 ? <p>Esta bodega no tiene vinos disponibles ahora mismo.</p> : <div className="wine-grid">{winery.vinos.map((wine) => <article className="wine-card" key={wine.id}><div className="wine-card-body"><p className="card-kicker">{wine.tipo_vino ?? 'Vino de bodega'}</p><h3><Link href={wineHref(wine.id)}>{wine.nombre_comercial}</Link></h3><div className="wine-card-footer"><strong>{formatEuro(wine.precio)}</strong><Link className="detail-link" href={wineHref(wine.id)}>Ver vino <span aria-hidden="true">→</span></Link></div></div></article>)}</div>}</section>
  </div>;
}
