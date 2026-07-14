import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { apiRequest, readAccessToken, readSessionIdentity } = vi.hoisted(() => ({ apiRequest: vi.fn(), readAccessToken: vi.fn(), readSessionIdentity: vi.fn() }));
vi.mock('../src/lib/api/client', () => ({ apiRequest }));
vi.mock('../src/lib/session/session', () => ({ readAccessToken, readSessionIdentity }));

import { allowedSubOrderTransitions } from '../src/lib/suborders/contracts';
import { getWinerySubOrder, listWinerySubOrders, transitionWinerySubOrder } from '../src/lib/suborders/server';

const id = '33333333-3333-4333-8333-333333333333';

beforeEach(() => {
  vi.clearAllMocks();
  readSessionIdentity.mockResolvedValue({ usuario_id: 'user', rol: 'bodega', bodega_id: 'winery' });
  readAccessToken.mockResolvedValue('opaque-token');
});

describe('contrato FE-007 SubPedidos de bodega', () => {
  it('lista únicamente SubPedidos propios por API-021', async () => {
    apiRequest.mockResolvedValue({ items: [], page: 1, page_size: 20, total_items: 0, total_pages: 0 });
    await listWinerySubOrders();
    expect(apiRequest).toHaveBeenCalledWith('/bodegas/yo/subpedidos?page=1&page_size=20', { method: 'GET', token: 'opaque-token' });
  });

  it('consulta detalle propio por API-022', async () => {
    apiRequest.mockResolvedValue({ id });
    await getWinerySubOrder(id);
    expect(apiRequest).toHaveBeenCalledWith(`/bodegas/yo/subpedidos/${id}`, { method: 'GET', token: 'opaque-token' });
  });

  it('envía solo estado_destino por API-023', async () => {
    apiRequest.mockResolvedValue({ id, estado: 'aceptado' });
    await transitionWinerySubOrder(id, 'aceptado');
    expect(apiRequest).toHaveBeenCalledWith(`/bodegas/yo/subpedidos/${id}/estado`, { method: 'PATCH', token: 'opaque-token', body: { estado_destino: 'aceptado' } });
  });

  it('representa exactamente la matriz contractual de transiciones', () => {
    expect(allowedSubOrderTransitions('pendiente')).toEqual(['aceptado', 'cancelado', 'incidencia']);
    expect(allowedSubOrderTransitions('incidencia')).toEqual(['en_preparacion', 'cancelado']);
    expect(allowedSubOrderTransitions('enviado')).toEqual(['entregado']);
    expect(allowedSubOrderTransitions('entregado')).toEqual([]);
    expect(allowedSubOrderTransitions('cancelado')).toEqual([]);
  });

  it('rechaza UUID manipulado antes de la API', async () => {
    await expect(getWinerySubOrder('../admin')).rejects.toThrow('SubPedido inválido');
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('bloquea bodega sin asociación y cualquier otro rol', async () => {
    readSessionIdentity.mockResolvedValue({ usuario_id: 'user', rol: 'bodega' });
    await expect(listWinerySubOrders()).rejects.toThrow('WINERY_SESSION_REQUIRED');
    readSessionIdentity.mockResolvedValue({ usuario_id: 'user', rol: 'administrador' });
    await expect(listWinerySubOrders()).rejects.toThrow('WINERY_SESSION_REQUIRED');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
