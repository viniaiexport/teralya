import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiProblem } from '@/lib/api/problem';
import { formatEuro } from '@/lib/checkout/contracts';
import { formatOrderDate, orderStateLabel } from '@/lib/orders/contracts';
import { listBuyerOrders } from '@/lib/orders/server';
import { readSessionIdentity } from '@/lib/session/session';

interface Props { searchParams: Promise<{ page?: string }> }

export default async function BuyerOrdersPage({ searchParams }: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso');
  const requested = Number((await searchParams).page ?? '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let orders;
  try {
    orders = await listBuyerOrders(page);
  } catch (error) {
    return <main className="screen-state screen-state-error"><p className="eyebrow">PT-COM-006</p><h1>No hemos podido cargar tus pedidos</h1><p className="screen-state-content">Inténtalo de nuevo dentro de unos instantes.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href="/pedidos">Reintentar</Link></main>;
  }
  return <main className="private-page orders-page">
    <nav className="breadcrumbs" aria-label="Migas de pan"><Link href="/cuenta">Mi cuenta</Link><span aria-hidden="true">/</span><span>Mis pedidos</span></nav>
    <header className="private-heading"><p className="eyebrow">PT-COM-006</p><h1>Mis pedidos</h1><p>El estado mostrado corresponde al pedido completo. Las bodegas gestionan internamente sus partes.</p></header>
    {orders.items.length === 0 ? <div className="catalog-message"><h2>Todavía no hay pedidos</h2><p>Cuando completes tu primera compra aparecerá aquí.</p><Link className="button primary" href="/vinos">Descubrir vinos</Link></div> : <div className="order-list">{orders.items.map(order => <article className="order-card" key={order.id}><div><p className="card-kicker">{formatOrderDate(order.created_at)}</p><h2>Pedido {order.numero_pedido}</h2><span className={`status-badge status-${order.estado}`}>{orderStateLabel(order.estado)}</span></div><div className="order-card-total"><span>Total</span><strong>{formatEuro(order.total)}</strong><Link className="button secondary" href={`/pedidos/${encodeURIComponent(order.id)}`}>Ver detalle</Link></div></article>)}</div>}
    {orders.total_pages > 1 && <nav className="pagination" aria-label="Paginación de pedidos">{page > 1 ? <Link href={`/pedidos?page=${page - 1}`}>← Anterior</Link> : <span aria-disabled="true">← Anterior</span>}<span>Página {orders.page} de {orders.total_pages}</span>{page < orders.total_pages ? <Link href={`/pedidos?page=${page + 1}`}>Siguiente →</Link> : <span aria-disabled="true">Siguiente →</span>}</nav>}
  </main>;
}
