'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAddress, createPaymentSession, deleteAddress, prepareOrder, safeCheckoutError, updateAddress, validatedStripeUrl } from '@/lib/checkout/server';
import { writePendingOrder } from '@/lib/checkout/pending-order';
import type { AddressInput, AddressUse, CheckoutActionState } from '@/lib/checkout/contracts';
import { isUuid } from '@/lib/cart/contracts';

function text(form: FormData, name: string, maximum: number, required = false): string | undefined {
  const value = String(form.get(name) ?? '').trim();
  if (value.length === 0) return required ? '' : undefined;
  return value.slice(0, maximum);
}

function addressPayload(form: FormData): { value?: AddressInput; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  const required = (name: string, maximum: number): string => {
    const value = text(form, name, maximum, true) ?? '';
    if (value.length === 0) errors[name] = ['Este campo es obligatorio.'];
    return value;
  };
  const uso = String(form.get('uso') ?? '') as AddressUse;
  if (!['envio', 'facturacion', 'ambos'].includes(uso)) errors.uso = ['Selecciona un uso válido.'];
  const value: AddressInput = {
    uso,
    nombre_destinatario: required('nombre_destinatario', 200),
    direccion: required('direccion', 500),
    codigo_postal: required('codigo_postal', 20),
    ciudad: required('ciudad', 100),
    pais: required('pais', 100),
    es_principal: form.get('es_principal') === 'on',
  };
  for (const [name, maximum] of [['nombre_identificativo',100],['empresa',200],['direccion_adicional',500],['provincia',100],['persona_contacto',100],['telefono',50],['email',254]] as const) {
    const optional = text(form, name, maximum);
    if (optional !== undefined) value[name] = optional;
  }
  if (value.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.email = ['Introduce un correo electrónico válido.'];
  return Object.keys(errors).length === 0 ? { value, errors } : { errors };
}

function failure(error: unknown, fallback: string): CheckoutActionState {
  const safe = safeCheckoutError(error, fallback);
  return { fieldErrors: {}, formError: safe.message, requestId: safe.requestId };
}

export async function createAddressAction(_previous: CheckoutActionState, form: FormData): Promise<CheckoutActionState> {
  const parsed = addressPayload(form);
  if (parsed.value === undefined) return { fieldErrors: parsed.errors };
  const key = String(form.get('idempotency_key') ?? '');
  if (!isUuid(key)) return { fieldErrors: {}, formError: 'La solicitud de dirección no es válida.' };
  try {
    await createAddress(key, parsed.value);
    revalidatePath('/checkout');
    return { fieldErrors: {}, success: 'Dirección guardada correctamente.' };
  } catch (error) {
    return failure(error, 'No se ha podido guardar la dirección.');
  }
}

export async function updateAddressAction(_previous: CheckoutActionState, form: FormData): Promise<CheckoutActionState> {
  const parsed = addressPayload(form);
  if (parsed.value === undefined) return { fieldErrors: parsed.errors };
  try {
    await updateAddress(String(form.get('direccion_id') ?? ''), parsed.value);
    revalidatePath('/checkout');
    return { fieldErrors: {}, success: 'Dirección actualizada.' };
  } catch (error) {
    return failure(error, 'No se ha podido actualizar la dirección.');
  }
}

export async function deleteAddressAction(form: FormData): Promise<void> {
  try {
    await deleteAddress(String(form.get('direccion_id') ?? ''));
    revalidatePath('/checkout');
  } catch {
    redirect('/checkout?direccion=eliminar-error');
  }
}

export async function prepareCheckoutAction(form: FormData): Promise<never> {
  const shipping = String(form.get('direccion_envio_id') ?? '');
  const billing = String(form.get('direccion_facturacion_id') ?? '');
  if (!isUuid(shipping) || !isUuid(billing)) redirect('/checkout?error=direcciones');
  try {
    const order = await prepareOrder(shipping, billing);
    await writePendingOrder(order.id);
    redirect(`/checkout/pago?pedido_id=${encodeURIComponent(order.id)}`);
  } catch (error) {
    const safe = safeCheckoutError(error, 'No se ha podido preparar el pedido.');
    redirect(`/checkout?error=preparacion${safe.requestId === undefined ? '' : `&request_id=${encodeURIComponent(safe.requestId)}`}`);
  }
}

export async function startPaymentAction(form: FormData): Promise<never> {
  const orderId = String(form.get('pedido_id') ?? '');
  try {
    const session = await createPaymentSession(orderId);
    await writePendingOrder(session.pedido_id);
    redirect(validatedStripeUrl(session.checkout_url));
  } catch (error) {
    const safe = safeCheckoutError(error, 'No se ha podido iniciar el pago.');
    redirect(`/checkout/pago?pedido_id=${encodeURIComponent(orderId)}&error=pago${safe.requestId === undefined ? '' : `&request_id=${encodeURIComponent(safe.requestId)}`}`);
  }
}
