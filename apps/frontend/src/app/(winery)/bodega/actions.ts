'use server';
import { redirect } from 'next/navigation';
import { isUuid } from '@/lib/cart/contracts';
import { isSubOrderState } from '@/lib/suborders/contracts';
import { transitionWinerySubOrder } from '@/lib/suborders/server';

export async function transitionSubOrderAction(form: FormData): Promise<never> {
  const id = String(form.get('subpedido_id') ?? '');
  const destination = String(form.get('estado_destino') ?? '');
  if (!isUuid(id) || !isSubOrderState(destination)) redirect('/bodega/subpedidos?error=solicitud');
  let updatedId: string;
  try {
    updatedId = (await transitionWinerySubOrder(id, destination)).id;
  } catch {
    redirect(`/bodega/subpedidos/${encodeURIComponent(id)}?error=transicion`);
  }
  redirect(`/bodega/subpedidos/${encodeURIComponent(updatedId)}?updated=1`);
}
