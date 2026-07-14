import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ConfirmationPoller } from '@/components/confirmation-poller';
import { isUuid } from '@/lib/cart/contracts';
import { getOrderConfirmation } from '@/lib/checkout/server';
import { ApiProblem } from '@/lib/api/problem';
import { readSessionIdentity } from '@/lib/session/session';

interface Props { params: Promise<{ pedido_id: string }> }

export default async function ConfirmationPage({ params }: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso');
  const { pedido_id: orderId } = await params;
  if (!isUuid(orderId)) notFound();
  let confirmation;
  try {
    confirmation = await getOrderConfirmation(orderId);
  } catch (error) {
    if (error instanceof ApiProblem && error.problem.status === 404) notFound();
    return <main className="screen-state"><h1>No hemos podido consultar el pago</h1><p>Inténtalo de nuevo dentro de unos instantes.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href={`/checkout/confirmacion/${encodeURIComponent(orderId)}`}>Reintentar</Link></main>;
  }
  const confirmed = confirmation.pago_estado === 'pagado' && confirmation.pedido_estado !== 'pendiente_pago';
  const endedWithoutPayment = ['fallido', 'cancelado'].includes(confirmation.pago_estado);
  if (confirmed) return <main className="screen-state confirmation-page"><p className="confirmation-mark" aria-hidden="true">✓</p><p className="eyebrow">PT-COM-005</p><h1>Pedido confirmado</h1><p className="screen-state-content">Stripe ha confirmado el pago y Teralya ha creado correctamente el pedido.</p><dl className="confirmation-details"><div><dt>Número de pedido</dt><dd>{confirmation.numero_pedido}</dd></div><div><dt>Estado</dt><dd>{confirmation.pedido_estado.replaceAll('_',' ')}</dd></div></dl><Link className="button primary" href={`/pedidos/${encodeURIComponent(orderId)}`}>Ver detalle del pedido</Link><Link className="button secondary" href="/vinos">Seguir comprando</Link></main>;
  if (endedWithoutPayment) return <main className="screen-state payment-page"><p className="eyebrow">Pago no completado</p><h1>El pedido sigue sin confirmar</h1><p className="screen-state-content">No mostramos el pedido como confirmado porque Stripe no ha validado el pago.</p><Link className="button primary" href={`/checkout/pago?pedido_id=${encodeURIComponent(orderId)}`}>Intentar de nuevo</Link><Link className="button secondary" href="/carrito">Volver al carrito</Link></main>;
  return <main className="screen-state payment-page"><p className="eyebrow">Comprobando pago</p><h1>Aún no está confirmado</h1><p className="screen-state-content">La vuelta desde Stripe no confirma por sí sola el pedido. Esperamos el webhook seguro del backend.</p><ConfirmationPoller/><Link className="button secondary" href={`/checkout/confirmacion/${encodeURIComponent(orderId)}`}>Comprobar ahora</Link></main>;
}
