import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { PedidosRepository } from "./pedidos.repository.js";
import type {
  OrderBuyerDetail,
  OrderSummary,
  PageOrderSummary,
} from "./dto/pedidos.dto.js";
@Injectable()
export class PedidosService {
  constructor(private readonly repository: PedidosRepository) {}
  async listar(
    owner: string,
    page: number,
    pageSize: number,
  ): Promise<PageOrderSummary> {
    const result = await this.repository.listar(owner, page, pageSize);
    return {
      items: result.items.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
      })),
      page,
      page_size: pageSize,
      total_items: result.total,
      total_pages: Math.ceil(result.total / pageSize),
    };
  }
  async obtener(owner: string, id: string): Promise<OrderBuyerDetail> {
    if (!isUUID(id)) this.notFound();
    const result = await this.repository.obtener(owner, id);
    if (result.kind === "missing") this.notFound();
    if (result.kind === "foreign")
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "El pedido pertenece a otro comprador.",
      });
    const r = result.order;
    const summary: OrderSummary = {
      id: r.id,
      numero_pedido: r.numero_pedido,
      estado: r.estado,
      total: r.total,
      moneda: "EUR",
      created_at: new Date(r.created_at).toISOString(),
    };
    return {
      ...summary,
      totales: {
        subtotal: r.subtotal,
        gastos_envio: r.gastos_envio,
        impuestos: r.impuestos,
        descuentos: r.descuentos,
        total: r.total,
        moneda: "EUR",
      },
      direccion_envio_snapshot: r.direccion_envio_snapshot,
      direccion_facturacion_snapshot: r.direccion_facturacion_snapshot,
      lineas: r.lineas,
      ...(r.subpedidos.length === 0 ? {} : { subpedidos: r.subpedidos }),
    };
  }
  private notFound(): never {
    throw new NotFoundException({
      code: "RESOURCE_NOT_FOUND",
      message: "Pedido no encontrado.",
    });
  }
}
