'use server';

import { redirect } from 'next/navigation';
import { isUuid } from '@/lib/cart/contracts';
import { cancelBuyerOrder } from '@/lib/orders/server';
import type { OrderCancellationStatus } from '@/lib/orders/contracts';

export async function cancelOrderAction(form: FormData): Promise<never> {
  const id = String(form.get('pedido_id') ?? '');
  const confirmed = form.get('confirmacion_cancelacion') === 'on';
  if (!isUuid(id) || !confirmed) redirect('/pedidos?error=cancelacion');

  let status: OrderCancellationStatus;
  try {
    status = (await cancelBuyerOrder(id)).estado;
  } catch {
    redirect(`/pedidos/${encodeURIComponent(id)}?error=cancelacion`);
  }
  redirect(`/pedidos/${encodeURIComponent(id)}?cancelacion=${status}`);
}
