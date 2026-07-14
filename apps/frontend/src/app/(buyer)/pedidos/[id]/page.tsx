import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ApiProblem } from '@/lib/api/problem';
import { isUuid } from '@/lib/cart/contracts';
import { formatEuro } from '@/lib/checkout/contracts';
import { formatOrderDate, orderStateLabel } from '@/lib/orders/contracts';
import { getBuyerOrder } from '@/lib/orders/server';
import { readSessionIdentity } from '@/lib/session/session';

interface Props { params: Promise<{ id: string }> }

function AddressBlock({ title, address }: { title: string; address: { nombre_destinatario: string; direccion: string; codigo_postal: string; ciudad: string; pais: string; empresa?: string; direccion_adicional?: string; provincia?: string } }) {
  return <article className="address-snapshot"><h2>{title}</h2><address><strong>{address.nombre_destinatario}</strong>{address.empresa && <span>{address.empresa}</span>}<span>{address.direccion}</span>{address.direccion_adicional && <span>{address.direccion_adicional}</span>}<span>{address.codigo_postal} {address.ciudad}{address.provincia ? `, ${address.provincia}` : ''}</span><span>{address.pais}</span></address></article>;
}

export default async function BuyerOrderDetailPage({ params }: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  let order;
  try {
    order = await getBuyerOrder(id);
  } catch (error) {
    if (error instanceof ApiProblem && [403, 404].includes(error.problem.status)) notFound();
    return <main className="screen-state screen-state-error"><h1>No hemos podido cargar el pedido</h1><p className="screen-state-content">Inténtalo de nuevo dentro de unos instantes.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href={`/pedidos/${encodeURIComponent(id)}`}>Reintentar</Link></main>;
  }
  return <section className="private-page order-detail-page">
    <nav className="breadcrumbs" aria-label="Migas de pan"><Link href="/cuenta">Mi cuenta</Link><span aria-hidden="true">/</span><Link href="/pedidos">Mis pedidos</Link><span aria-hidden="true">/</span><span>{order.numero_pedido}</span></nav>
    <header className="private-heading order-detail-heading"><div><p className="eyebrow">PT-COM-007</p><h1>Pedido {order.numero_pedido}</h1><p>Realizado el {formatOrderDate(order.created_at)}</p></div><span className={`status-badge status-${order.estado}`}>{orderStateLabel(order.estado)}</span></header>
    <div className="order-detail-layout"><div><section className="order-lines" aria-labelledby="order-lines-title"><h2 id="order-lines-title">Vinos del pedido</h2>{order.lineas.map(line => <article className="order-line" key={line.id}><div><h3>{line.nombre_vino}</h3><p>{line.bodega}{line.anada === undefined ? '' : ` · Añada ${line.anada}`}</p><small>{line.cantidad} × {formatEuro(line.precio_unitario)}</small></div><strong>{formatEuro(line.importe_total)}</strong></article>)}</section><div className="snapshot-grid"><AddressBlock title="Dirección de envío" address={order.direccion_envio_snapshot}/><AddressBlock title="Dirección de facturación" address={order.direccion_facturacion_snapshot}/></div></div><aside className="checkout-summary order-totals"><h2>Resumen</h2><dl><div><dt>Subtotal</dt><dd>{formatEuro(order.totales.subtotal)}</dd></div><div><dt>Envío</dt><dd>{formatEuro(order.totales.gastos_envio)}</dd></div><div><dt>Impuestos</dt><dd>{formatEuro(order.totales.impuestos)}</dd></div><div><dt>Descuentos</dt><dd>−{formatEuro(order.totales.descuentos)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{formatEuro(order.totales.total)}</dd></div></dl><p>Importes y líneas congelados en el momento de confirmar el pedido.</p></aside></div>
  </section>;
}
