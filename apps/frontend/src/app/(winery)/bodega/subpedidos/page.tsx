import Link from 'next/link';
import { ApiProblem } from '@/lib/api/problem';
import { formatEuro } from '@/lib/checkout/contracts';
import { formatOrderDate } from '@/lib/orders/contracts';
import { subOrderStateLabel } from '@/lib/suborders/contracts';
import { listWinerySubOrders } from '@/lib/suborders/server';

interface Props { searchParams: Promise<{ page?: string }> }

export default async function WinerySubOrdersPage({ searchParams }: Props) {
  const requested = Number((await searchParams).page ?? '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let result;
  try { result = await listWinerySubOrders(page); }
  catch (error) { return <section className="screen-state screen-state-error"><p className="eyebrow">PT-BOD-007</p><h1>No hemos podido cargar los SubPedidos</h1><p className="screen-state-content">Comprueba que la bodega sigue validada e inténtalo de nuevo.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href="/bodega/subpedidos">Reintentar</Link></section>; }
  return <section className="private-page"><nav className="breadcrumbs" aria-label="Migas de pan"><Link href="/bodega">Panel</Link><span aria-hidden="true">/</span><span>SubPedidos</span></nav><header className="private-heading"><p className="eyebrow">PT-BOD-007</p><h1>SubPedidos de la bodega</h1><p>Cada SubPedido contiene únicamente las líneas y datos de envío necesarios para tu operativa.</p></header>{result.items.length === 0 ? <div className="catalog-message"><h2>No hay SubPedidos asignados</h2><p>Los nuevos aparecerán después de que Stripe confirme los pedidos correspondientes.</p></div> : <div className="order-list">{result.items.map(item => <article className="order-card" key={item.id}><div><p className="card-kicker">Actualizado {formatOrderDate(item.fecha_ultimo_cambio_estado)}</p><h2>SubPedido {item.id.slice(0, 8)}</h2><span className={`status-badge status-${item.estado}`}>{subOrderStateLabel(item.estado)}</span></div><div className="order-card-total"><span>Total de la bodega</span><strong>{formatEuro(item.total)}</strong><Link className="button secondary" href={`/bodega/subpedidos/${encodeURIComponent(item.id)}`}>Abrir</Link></div></article>)}</div>}{result.total_pages > 1 && <nav className="pagination" aria-label="Paginación de SubPedidos">{page > 1 ? <Link href={`/bodega/subpedidos?page=${page - 1}`}>← Anterior</Link> : <span aria-disabled="true">← Anterior</span>}<span>Página {result.page} de {result.total_pages}</span>{page < result.total_pages ? <Link href={`/bodega/subpedidos?page=${page + 1}`}>Siguiente →</Link> : <span aria-disabled="true">Siguiente →</span>}</nav>}</section>;
}
