import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiProblem } from '@/lib/api/problem';
import { isUuid } from '@/lib/cart/contracts';
import { formatEuro } from '@/lib/checkout/contracts';
import { formatOrderDate } from '@/lib/orders/contracts';
import { allowedSubOrderTransitions, subOrderStateLabel } from '@/lib/suborders/contracts';
import { getWinerySubOrder } from '@/lib/suborders/server';
import { transitionSubOrderAction } from '../../actions';

interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; updated?: string }> }

export default async function WinerySubOrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  let item;
  try { item = await getWinerySubOrder(id); }
  catch (error) { if (error instanceof ApiProblem && [403,404].includes(error.problem.status)) notFound(); return <section className="screen-state screen-state-error"><h1>No hemos podido cargar el SubPedido</h1><p className="screen-state-content">Inténtalo de nuevo dentro de unos instantes.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href={`/bodega/subpedidos/${encodeURIComponent(id)}`}>Reintentar</Link></section>; }
  const query = await searchParams;
  const transitions = allowedSubOrderTransitions(item.estado);
  const address = item.direccion_envio_snapshot;
  return <section className="private-page order-detail-page"><nav className="breadcrumbs" aria-label="Migas de pan"><Link href="/bodega">Panel</Link><span aria-hidden="true">/</span><Link href="/bodega/subpedidos">SubPedidos</Link><span aria-hidden="true">/</span><span>{item.id.slice(0,8)}</span></nav><header className="private-heading order-detail-heading"><div><p className="eyebrow">PT-BOD-008</p><h1>SubPedido {item.id.slice(0,8)}</h1><p>Último cambio: {formatOrderDate(item.fecha_ultimo_cambio_estado)}</p></div><span className={`status-badge status-${item.estado}`}>{subOrderStateLabel(item.estado)}</span></header>{query.updated === '1' && <div className="form-status form-success"><p>Estado actualizado y pedido global recalculado.</p></div>}{query.error && <div className="form-status form-error"><p>No se ha podido realizar la transición solicitada.</p></div>}<div className="order-detail-layout"><div><section className="order-lines"><h2>Vinos que debe preparar la bodega</h2>{item.lineas.map(line => <article className="order-line" key={line.id}><div><h3>{line.nombre_vino}</h3><p>{line.anada === undefined ? line.bodega : `${line.bodega} · Añada ${line.anada}`}</p><small>{line.cantidad} × {formatEuro(line.precio_unitario)}</small></div><strong>{formatEuro(line.importe_total)}</strong></article>)}</section><div className="snapshot-grid"><article className="address-snapshot"><h2>Dirección de envío</h2><address><strong>{address.nombre_destinatario}</strong><span>{address.direccion}</span>{address.direccion_adicional && <span>{address.direccion_adicional}</span>}<span>{address.codigo_postal} {address.ciudad}{address.provincia ? `, ${address.provincia}` : ''}</span><span>{address.pais}</span></address></article><article className="address-snapshot"><h2>Seguimiento</h2><dl className="tracking-list"><div><dt>Transportista</dt><dd>{item.tracking.transportista ?? 'Pendiente'}</dd></div><div><dt>Número</dt><dd>{item.tracking.numero_seguimiento ?? 'Pendiente'}</dd></div></dl></article></div></div><aside className="checkout-summary order-totals"><h2>Operativa</h2><dl><div><dt>Subtotal</dt><dd>{formatEuro(item.totales.subtotal)}</dd></div><div><dt>Envío</dt><dd>{formatEuro(item.totales.gastos_envio)}</dd></div><div><dt>Impuestos</dt><dd>{formatEuro(item.totales.impuestos)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{formatEuro(item.totales.total)}</dd></div></dl>{transitions.length > 0 ? <form action={transitionSubOrderAction} className="transition-form"><input type="hidden" name="subpedido_id" value={item.id}/><label htmlFor="estado_destino">Cambiar estado</label><select id="estado_destino" name="estado_destino" required defaultValue=""><option value="" disabled>Selecciona el siguiente estado</option>{transitions.map(state => <option value={state} key={state}>{subOrderStateLabel(state)}</option>)}</select><button className="button primary" type="submit">Confirmar cambio</button></form> : <p>Este estado es terminal y no admite más cambios.</p>}</aside></div></section>;
}
