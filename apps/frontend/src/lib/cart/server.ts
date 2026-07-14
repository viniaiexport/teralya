import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { ApiProblem } from '@/lib/api/problem';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import { isQuantity, isUuid, MAX_CART_LINES, type Cart, type CartActionResult, type CartMutationResponse } from './contracts';

async function buyerToken(): Promise<string | undefined> {
  const [identity, token] = await Promise.all([readSessionIdentity(), readAccessToken()]);
  return identity?.rol === 'comprador' ? token : undefined;
}

function failure(error: unknown): CartActionResult {
  if (error instanceof ApiProblem) {
    const byStatus: Record<number, string> = {
      400: 'Revisa la cantidad indicada.',
      401: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
      404: 'Este vino ya no está disponible.',
      409: 'El carrito ha cambiado. Revísalo antes de continuar.',
      429: 'Demasiadas operaciones seguidas. Espera un momento.',
    };
    return { ok: false, message: byStatus[error.problem.status] ?? 'No se ha podido actualizar el carrito.', requestId: error.problem.request_id };
  }
  return { ok: false, message: 'No se ha podido actualizar el carrito.' };
}

export async function getBuyerCart(): Promise<Cart | undefined> {
  const token = await buyerToken();
  if (token === undefined) return undefined;
  return apiRequest<Cart>('/carrito', { method: 'GET', token });
}

export async function addBuyerItem(wineId: string, quantity: number): Promise<CartActionResult> {
  const token = await buyerToken();
  if (token === undefined) return { ok: false, message: 'Inicia sesión como comprador para continuar.' };
  if (!isUuid(wineId) || !isQuantity(quantity)) return { ok: false, message: 'La cantidad indicada no es válida.' };
  try {
    const result = await apiRequest<CartMutationResponse>('/carrito/items', { method: 'POST', token, body: { vino_id: wineId, cantidad: quantity } });
    return { ok: true, carrito: result.carrito, fusion: result.fusion };
  } catch (error) {
    return failure(error);
  }
}

export async function mergeGuestCart(fusionId: string, items: Array<{ vino_id: string; cantidad_local: number }>): Promise<CartActionResult> {
  const token = await buyerToken();
  if (token === undefined) return { ok: false, message: 'Inicia sesión como comprador para fusionar el carrito.' };
  if (!isUuid(fusionId) || items.length < 1 || items.length > MAX_CART_LINES || new Set(items.map((item) => item.vino_id)).size !== items.length || items.some((item) => !isUuid(item.vino_id) || !isQuantity(item.cantidad_local))) {
    return { ok: false, message: 'El carrito local no es válido.' };
  }
  try {
    const result = await apiRequest<CartMutationResponse>('/carrito/items', { method: 'POST', token, body: { fusion_id: fusionId, items } });
    return { ok: true, carrito: result.carrito, fusion: result.fusion };
  } catch (error) {
    return failure(error);
  }
}

export async function updateBuyerItem(itemId: string, quantity: number): Promise<CartActionResult> {
  const token = await buyerToken();
  if (token === undefined) return { ok: false, message: 'Tu sesión ha caducado.' };
  if (!isUuid(itemId) || !isQuantity(quantity)) return { ok: false, message: 'La cantidad indicada no es válida.' };
  try {
    const carrito = await apiRequest<Cart>(`/carrito/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', token, body: { cantidad: quantity } });
    return { ok: true, carrito };
  } catch (error) {
    return failure(error);
  }
}

export async function removeBuyerItem(itemId: string): Promise<CartActionResult> {
  const token = await buyerToken();
  if (token === undefined || !isUuid(itemId)) return { ok: false, message: 'No se ha podido eliminar la línea.' };
  try {
    const carrito = await apiRequest<Cart>(`/carrito/items/${encodeURIComponent(itemId)}`, { method: 'DELETE', token });
    return { ok: true, carrito };
  } catch (error) {
    return failure(error);
  }
}

export async function clearBuyerCart(): Promise<CartActionResult> {
  const token = await buyerToken();
  if (token === undefined) return { ok: false, message: 'Tu sesión ha caducado.' };
  try {
    const carrito = await apiRequest<Cart>('/carrito', { method: 'DELETE', token });
    return { ok: true, carrito };
  } catch (error) {
    return failure(error);
  }
}
