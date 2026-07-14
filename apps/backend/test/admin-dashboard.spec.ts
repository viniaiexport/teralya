import { describe, expect, it, vi } from 'vitest';
import type { AdminDashboardRepository } from '../src/modules/admin/admin-dashboard.repository.js';
import { AdminDashboardService } from '../src/modules/admin/admin-dashboard.service.js';

describe('API-028 dashboard administrativo', () => {
  it('proyecta únicamente los dos indicadores del contrato', async () => {
    const repository = {
      obtener: vi.fn().mockResolvedValue({
        sales_amount: '120.50',
        sales_orders: 3,
        pending_orders: 7,
      }),
    };
    const service = new AdminDashboardService(repository as unknown as AdminDashboardRepository);

    await expect(service.obtener()).resolves.toEqual({
      ventas_dia: { importe: '120.50', moneda: 'EUR', num_pedidos: 3 },
      pedidos_pendientes: 7,
    });
  });

  it('mantiene el estado vacío contractual sin nulos', async () => {
    const repository = {
      obtener: vi.fn().mockResolvedValue({ sales_amount: '0.00', sales_orders: 0, pending_orders: 0 }),
    };
    const service = new AdminDashboardService(repository as unknown as AdminDashboardRepository);

    await expect(service.obtener()).resolves.toEqual({
      ventas_dia: { importe: '0.00', moneda: 'EUR', num_pedidos: 0 },
      pedidos_pendientes: 0,
    });
  });
});
