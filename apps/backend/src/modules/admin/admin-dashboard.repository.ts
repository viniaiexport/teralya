import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service.js';

export interface AdminDashboardRecord {
  sales_amount: string;
  sales_orders: number;
  pending_orders: number;
}

@Injectable()
export class AdminDashboardRepository {
  constructor(private readonly database: DatabaseService) {}

  async obtener(): Promise<AdminDashboardRecord> {
    const rows = await this.database.query<AdminDashboardRecord>(
      `WITH madrid_day AS (
         SELECT date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid' AS starts_at
       ), sales AS (
         SELECT coalesce(sum(pa.total_cobrado), 0)::numeric(10,2)::text AS amount,
                count(*)::int AS orders
         FROM pago pa
         CROSS JOIN madrid_day d
         WHERE pa.estado = 'pagado'
           AND pa.fecha_captura >= d.starts_at
           AND pa.fecha_captura < d.starts_at + interval '1 day'
       ), pending AS (
         SELECT count(*)::int AS orders
         FROM pedido pe
         WHERE pe.estado = 'pendiente_pago'
       )
       SELECT sales.amount AS sales_amount,
              sales.orders AS sales_orders,
              pending.orders AS pending_orders
       FROM sales CROSS JOIN pending`,
    );
    const result = rows[0];
    if (result === undefined) {
      throw new Error('La consulta del dashboard no devolvió resultado.');
    }
    return result;
  }
}
