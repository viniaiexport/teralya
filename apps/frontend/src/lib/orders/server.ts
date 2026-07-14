import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { isUuid } from '@/lib/cart/contracts';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import type { OrderBuyerDetail, OrderSummary, Page } from './contracts';

async function requiredBuyerToken(): Promise<string> {
  const [identity, token] = await Promise.all([readSessionIdentity(), readAccessToken()]);
  if (identity?.rol !== 'comprador' || token === undefined) throw new Error('BUYER_SESSION_REQUIRED');
  return token;
}

export async function listBuyerOrders(page = 1, pageSize = 20): Promise<Page<OrderSummary>> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
  return apiRequest<Page<OrderSummary>>(`/pedidos?page=${safePage}&page_size=${safePageSize}`, {
    method: 'GET',
    token: await requiredBuyerToken(),
  });
}

export async function getBuyerOrder(orderId: string): Promise<OrderBuyerDetail> {
  if (!isUuid(orderId)) throw new Error('Pedido inválido.');
  return apiRequest<OrderBuyerDetail>(`/pedidos/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    token: await requiredBuyerToken(),
  });
}
