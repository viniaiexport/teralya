import 'server-only';
import { cookies } from 'next/headers';
import { isUuid } from '@/lib/cart/contracts';

const PENDING_ORDER_COOKIE = 'teralya_pending_order';
const MAX_AGE_SECONDS = 30 * 60;

export async function writePendingOrder(orderId: string): Promise<void> {
  if (!isUuid(orderId)) throw new Error('Pedido inválido.');
  (await cookies()).set(PENDING_ORDER_COOKIE, orderId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/checkout',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readPendingOrder(): Promise<string | undefined> {
  const value = (await cookies()).get(PENDING_ORDER_COOKIE)?.value;
  return value !== undefined && isUuid(value) ? value : undefined;
}

export async function clearPendingOrder(): Promise<void> {
  (await cookies()).delete(PENDING_ORDER_COOKIE);
}
