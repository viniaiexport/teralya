import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service.js";
import type { AddressSnapshot } from "../checkout/dto/checkout.dto.js";
import type {
  BuyerSubOrderSummary,
  OrderLine,
  OrderState,
} from "./dto/pedidos.dto.js";
export interface OrderRecord {
  id: string;
  numero_pedido: string;
  comprador_id: string;
  estado: OrderState;
  subtotal: string;
  gastos_envio: string;
  impuestos: string;
  descuentos: string;
  total: string;
  moneda: "EUR";
  created_at: Date | string;
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
  lineas: OrderLine[];
  subpedidos: BuyerSubOrderSummary[];
}
export type OwnedOrder =
  | { kind: "found"; order: OrderRecord }
  | { kind: "foreign" }
  | { kind: "missing" };
@Injectable()
export class PedidosRepository {
  constructor(private readonly database: DatabaseService) {}
  async listar(
    owner: string,
    page: number,
    pageSize: number,
  ): Promise<{
    items: Omit<
      OrderRecord,
      | "lineas"
      | "subpedidos"
      | "subtotal"
      | "gastos_envio"
      | "impuestos"
      | "descuentos"
      | "direccion_envio_snapshot"
      | "direccion_facturacion_snapshot"
      | "comprador_id"
    >[];
    total: number;
  }> {
    const [items, count] = await Promise.all([
      this.database.query<
        Pick<
          OrderRecord,
          "id" | "numero_pedido" | "estado" | "total" | "moneda" | "created_at"
        >
      >(
        `SELECT id,numero_pedido,estado,total::text,'EUR'::text AS moneda,created_at FROM pedido WHERE comprador_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3`,
        [owner, pageSize, (page - 1) * pageSize],
      ),
      this.database.query<{ total: number }>(
        "SELECT count(*)::int total FROM pedido WHERE comprador_id=$1",
        [owner],
      ),
    ]);
    return { items, total: count[0]?.total ?? 0 };
  }
  async obtener(owner: string, id: string): Promise<OwnedOrder> {
    const rows = await this.database.query<
      Omit<OrderRecord, "lineas" | "subpedidos">
    >(
      `SELECT id,numero_pedido,comprador_id,estado,subtotal::text,gastos_envio::text,impuestos::text,descuentos::text,total::text,'EUR'::text AS moneda,created_at,direccion_envio_snapshot,direccion_facturacion_snapshot FROM pedido WHERE id=$1`,
      [id],
    );
    const order = rows[0];
    if (order === undefined) return { kind: "missing" };
    if (order.comprador_id !== owner) return { kind: "foreign" };
    const [lineas, subpedidos] = await Promise.all([
      this.database.query<OrderLine>(
        `SELECT id,vino_id,nombre_vino_snapshot AS nombre_vino,bodega_snapshot AS bodega,precio_unitario::text,cantidad,importe_total::text,anada_snapshot AS anada FROM pedido_item WHERE pedido_id=$1 ORDER BY created_at,id`,
        [id],
      ),
      this.database.query<BuyerSubOrderSummary>(
        `SELECT id,estado,total::text,'EUR'::text AS moneda FROM subpedido WHERE pedido_id=$1 ORDER BY fecha_ultimo_cambio_estado,id`,
        [id],
      ),
    ]);
    return { kind: "found", order: { ...order, lineas, subpedidos } };
  }
}
