import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { ApiProblem } from '@/lib/api/problem';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import { isUuid } from '@/lib/cart/contracts';
import type { Address, AddressInput, CheckoutSession, OrderConfirmation, OrderPrepared } from './contracts';

async function buyerToken(): Promise<string | undefined> {
  const [identity, token] = await Promise.all([readSessionIdentity(), readAccessToken()]);
  return identity?.rol === 'comprador' ? token : undefined;
}

export function safeCheckoutError(error: unknown, fallback: string): { message: string; requestId?: string } {
  if (!(error instanceof ApiProblem)) return { message: fallback };
  const messages: Record<number, string> = {
    400: 'Revisa los datos indicados.',
    401: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    403: 'No tienes permiso para realizar esta operación.',
    404: 'El recurso solicitado ya no está disponible.',
    409: 'Los datos han cambiado. Revísalos antes de continuar.',
    429: 'Demasiados intentos. Espera un momento.',
    502: 'Stripe no ha podido procesar la solicitud.',
    503: 'Stripe no está disponible temporalmente.',
  };
  return { message: messages[error.problem.status] ?? fallback, requestId: error.problem.request_id };
}

async function requiredToken(): Promise<string> {
  const token = await buyerToken();
  if (token === undefined) throw new Error('BUYER_SESSION_REQUIRED');
  return token;
}

export async function listAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>('/direcciones', { method: 'GET', token: await requiredToken() });
}

export async function createAddress(idempotencyKey: string, input: AddressInput): Promise<Address> {
  if (!isUuid(idempotencyKey)) throw new Error('Idempotency-Key inválida.');
  return apiRequest<Address>('/direcciones', { method: 'POST', token: await requiredToken(), headers: { 'Idempotency-Key': idempotencyKey }, body: input });
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  if (!isUuid(id)) throw new Error('Dirección inválida.');
  return apiRequest<Address>(`/direcciones/${encodeURIComponent(id)}`, { method: 'PATCH', token: await requiredToken(), body: input });
}

export async function deleteAddress(id: string): Promise<void> {
  if (!isUuid(id)) throw new Error('Dirección inválida.');
  return apiRequest<void>(`/direcciones/${encodeURIComponent(id)}`, { method: 'DELETE', token: await requiredToken() });
}

export async function prepareOrder(shippingAddressId: string, billingAddressId: string): Promise<OrderPrepared> {
  if (!isUuid(shippingAddressId) || !isUuid(billingAddressId)) throw new Error('Direcciones inválidas.');
  return apiRequest<OrderPrepared>('/checkout', { method: 'POST', token: await requiredToken(), body: { direccion_envio_id: shippingAddressId, direccion_facturacion_id: billingAddressId } });
}

export async function createPaymentSession(orderId: string): Promise<CheckoutSession> {
  if (!isUuid(orderId)) throw new Error('Pedido inválido.');
  return apiRequest<CheckoutSession>('/checkout/pago', { method: 'POST', token: await requiredToken(), body: { pedido_id: orderId } });
}

export async function getOrderConfirmation(orderId: string): Promise<OrderConfirmation> {
  if (!isUuid(orderId)) throw new Error('Pedido inválido.');
  return apiRequest<OrderConfirmation>(`/checkout/confirmacion/${encodeURIComponent(orderId)}`, { method: 'GET', token: await requiredToken() });
}

export function validatedStripeUrl(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || (url.hostname !== 'checkout.stripe.com' && !url.hostname.endsWith('.stripe.com'))) throw new Error('URL de Stripe no válida.');
  return url.toString();
}
