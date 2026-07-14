import Link from 'next/link';
import { redirect } from 'next/navigation';
import { startPaymentAction } from '../actions';
import { isUuid } from '@/lib/cart/contracts';
import { readSessionIdentity } from '@/lib/session/session';

interface Props { searchParams: Promise<{ pedido_id?: string | string[]; error?: string | string[]; request_id?: string | string[] }> }

export default async function PaymentPage({ searchParams }: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso?next=/checkout');
  const query = await searchParams;
  const orderId = Array.isArray(query.pedido_id) ? undefined : query.pedido_id;
  if (orderId === undefined || !isUuid(orderId)) redirect('/carrito');
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const requestId = Array.isArray(query.request_id) ? query.request_id[0] : query.request_id;
  return <main className="screen-state payment-page"><p className="eyebrow">PT-COM-004</p><h1>Pedido preparado</h1><p className="screen-state-content">El pedido está pendiente de pago. Al continuar, te enviaremos a la página segura de Stripe.</p>{error !== undefined && <div className="form-status form-error" role="alert"><p>No se ha podido iniciar el pago. Puedes volver a intentarlo.</p>{requestId !== undefined && <small>Referencia: {requestId}</small>}</div>}<div className="payment-security"><strong>Pago seguro con Stripe</strong><p>Teralya no recibe ni almacena los datos de tu tarjeta.</p></div><form action={startPaymentAction}><input name="pedido_id" type="hidden" value={orderId}/><button className="button primary" type="submit">Pagar en Stripe</button></form><Link className="button secondary" href="/checkout">Volver a direcciones</Link></main>;
}
