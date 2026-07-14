import { Injectable } from '@nestjs/common';
import type { AdminDashboard } from './dto/admin-dashboard.dto.js';
import { AdminDashboardRepository } from './admin-dashboard.repository.js';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly repository: AdminDashboardRepository) {}

  async obtener(): Promise<AdminDashboard> {
    const result = await this.repository.obtener();
    return {
      ventas_dia: {
        importe: result.sales_amount,
        moneda: 'EUR',
        num_pedidos: result.sales_orders,
      },
      pedidos_pendientes: result.pending_orders,
    };
  }
}
