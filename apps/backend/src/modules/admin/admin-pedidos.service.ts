import { Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import {
  AdminPedidosRepository,
  type AdminOrderRecord,
  type AdminSubOrderRecord,
} from './admin-pedidos.repository.js';
import type {
  OrderAdminDetail,
  OrderLine,
  OrderSummary,
  PageOrderSummary,
  SubOrderDetail,
  Tracking,
} from './dto/admin-pedidos.dto.js';

@Injectable()
export class AdminPedidosService {
  constructor(private readonly repository: AdminPedidosRepository) {}

  async listar(page: number, pageSize: number): Promise<PageOrderSummary> {
    const result = await this.repository.listar(page, pageSize);
    return {
      items: result.items.map((row) => this.summary(row)),
      page,
      page_size: pageSize,
      total_items: result.total,
      total_pages: Math.ceil(result.total / pageSize),
    };
  }

  async obtener(id: string): Promise<OrderAdminDetail> {
    if (!isUUID(id)) this.notFound();
    const order = await this.repository.obtener(id);
    if (order === null) this.notFound();
    return {
      ...this.summary(order),
      comprador_id: order.comprador_id,
      totales: {
        subtotal: order.subtotal,
        gastos_envio: order.gastos_envio,
        impuestos: order.impuestos,
        descuentos: order.descuentos,
        total: order.total,
        moneda: 'EUR',
      },
      direccion_envio_snapshot: order.direccion_envio_snapshot,
      direccion_facturacion_snapshot: order.direccion_facturacion_snapshot,
      lineas: order.lineas.map((line) => this.line(line)),
      subpedidos: order.subpedidos.map((suborder) => this.suborder(order, suborder)),
    };
  }

  private summary(
    row: Pick<AdminOrderRecord, 'id' | 'numero_pedido' | 'estado' | 'total' | 'created_at'>,
  ): OrderSummary {
    return {
      id: row.id,
      numero_pedido: row.numero_pedido,
      estado: row.estado,
      total: row.total,
      moneda: 'EUR',
      created_at: this.iso(row.created_at),
    };
  }

  private suborder(order: AdminOrderRecord, row: AdminSubOrderRecord): SubOrderDetail {
    return {
      id: row.id,
      pedido_id: row.pedido_id,
      estado: row.estado,
      total: row.total,
      moneda: 'EUR',
      fecha_ultimo_cambio_estado: this.iso(row.fecha_ultimo_cambio_estado),
      totales: {
        subtotal: row.subtotal,
        gastos_envio: row.gastos_envio,
        impuestos: row.impuestos,
        total: row.total,
        moneda: 'EUR',
      },
      lineas: row.lineas.map((line) => this.line(line)),
      direccion_envio_snapshot: order.direccion_envio_snapshot,
      tracking: this.tracking(row),
      pedido_estado: order.estado,
    };
  }

  private line(line: OrderLine): OrderLine {
    const { anada, ...required } = line;
    return anada === null || anada === undefined ? required : { ...required, anada };
  }

  private tracking(row: AdminSubOrderRecord): Tracking {
    return {
      ...this.optional(row.transportista, 'transportista'),
      ...this.optional(row.numero_seguimiento, 'numero_seguimiento'),
      ...this.date(row.fecha_preparacion, 'fecha_preparacion'),
      ...this.date(row.fecha_envio, 'fecha_envio'),
      ...this.date(row.fecha_entrega_prevista, 'fecha_entrega_prevista'),
      ...this.date(row.fecha_entrega_real, 'fecha_entrega_real'),
    };
  }

  private optional(value: string | null, key: string): Record<string, string> {
    return value === null ? {} : { [key]: value };
  }

  private date(value: Date | string | null, key: string): Record<string, string> {
    return value === null ? {} : { [key]: this.iso(value) };
  }

  private iso(value: Date | string): string {
    return new Date(value).toISOString();
  }

  private notFound(): never {
    throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'Pedido no encontrado.' });
  }
}
