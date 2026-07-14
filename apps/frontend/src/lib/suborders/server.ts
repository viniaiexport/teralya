import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { isUuid } from '@/lib/cart/contracts';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import type { SubOrderDetail, SubOrderPage, SubOrderState } from './contracts';

async function requiredWineryToken(): Promise<string> {
  const [identity, token] = await Promise.all([readSessionIdentity(), readAccessToken()]);
  if (identity?.rol !== 'bodega' || identity.bodega_id === undefined || token === undefined) throw new Error('WINERY_SESSION_REQUIRED');
  return token;
}

export async function listWinerySubOrders(page = 1, pageSize = 20): Promise<SubOrderPage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
  return apiRequest<SubOrderPage>(`/bodegas/yo/subpedidos?page=${safePage}&page_size=${safePageSize}`, { method: 'GET', token: await requiredWineryToken() });
}

export async function getWinerySubOrder(id: string): Promise<SubOrderDetail> {
  if (!isUuid(id)) throw new Error('SubPedido inválido.');
  return apiRequest<SubOrderDetail>(`/bodegas/yo/subpedidos/${encodeURIComponent(id)}`, { method: 'GET', token: await requiredWineryToken() });
}

export async function transitionWinerySubOrder(id: string, destination: SubOrderState): Promise<SubOrderDetail> {
  if (!isUuid(id)) throw new Error('SubPedido inválido.');
  return apiRequest<SubOrderDetail>(`/bodegas/yo/subpedidos/${encodeURIComponent(id)}/estado`, { method: 'PATCH', token: await requiredWineryToken(), body: { estado_destino: destination } });
}
