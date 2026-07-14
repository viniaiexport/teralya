import { redirect } from 'next/navigation';
import { readPendingOrder } from '@/lib/checkout/pending-order';

export default async function StripeSuccessPage() {
  const orderId = await readPendingOrder();
  if (orderId === undefined) redirect('/carrito');
  redirect(`/checkout/confirmacion/${encodeURIComponent(orderId)}`);
}
