import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service.js';
import type {
  AddressSnapshot,
  OrderLine,
  OrderState,
  SubOrderState,
} from './dto/admin-pedidos.dto.js';

export interface AdminOrderRecord {
  id: string;
  numero_pedido: string;
  comprador_id: string;
  estado: OrderState;
  subtotal: string;
  gastos_envio: string;
  impuestos: string;
  descuentos: string;
  total: string;
  moneda: string;
  created_at: Date | string;
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
  lineas: OrderLine[];
  subpedidos: AdminSubOrderRecord[];
}

export interface AdminSubOrderRecord {
  id: string;
  pedido_id: string;
  estado: SubOrderState;
  subtotal: string;
  gastos_envio: string;
  impuestos: string;
  total: string;
  fecha_ultimo_cambio_estado: Date | string;
  transportista: string | null;
  numero_seguimiento: string | null;
  fecha_preparacion: Date | string | null;
  fecha_envio: Date | string | null;
  fecha_entrega_prevista: Date | string | null;
  fecha_entrega_real: Date | string | null;
  lineas: OrderLine[];
}

export interface AdminOrderPage {
  items: Pick<AdminOrderRecord, 'id' | 'numero_pedido' | 'estado' | 'total' | 'moneda' | 'created_at'>[];
  total: number;
}

const LINE_COLUMNS = `id,vino_id,nombre_vino_snapshot AS nombre_vino,bodega_snapshot AS bodega,
  precio_unitario::text,cantidad,importe_total::text,anada_snapshot AS anada`;

@Injectable()
export class AdminPedidosRepository {
  constructor(private readonly database: DatabaseService) {}

  async listar(page: number, pageSize: number): Promise<AdminOrderPage> {
    const [items, count] = await Promise.all([
      this.database.query<AdminOrderPage['items'][number]>(
        `SELECT id,numero_pedido,estado,total::text,'EUR' AS moneda,created_at FROM pedido ORDER BY created_at DESC,id DESC LIMIT $1 OFFSET $2`,
        [pageSize, (page - 1) * pageSize],
      ),
      this.database.query<{ total: number }>('SELECT count(*)::int AS total FROM pedido'),
    ]);
    return { items, total: count[0]?.total ?? 0 };
  }

  async obtener(id: string): Promise<AdminOrderRecord | null> {
    const rows = await this.database.query<Omit<AdminOrderRecord, 'lineas' | 'subpedidos'>>(
      `SELECT id,numero_pedido,comprador_id,estado,subtotal::text,gastos_envio::text,impuestos::text,descuentos::text,total::text,'EUR' AS moneda,created_at,direccion_envio_snapshot,direccion_facturacion_snapshot FROM pedido WHERE id=$1`,
      [id],
    );
    const order = rows[0];
    if (order === undefined) return null;
    const [lineas, subpedidos] = await Promise.all([
      this.database.query<OrderLine>(
        `SELECT ${LINE_COLUMNS} FROM pedido_item WHERE pedido_id=$1 ORDER BY created_at,id`,
        [id],
      ),
      this.database.query<Omit<AdminSubOrderRecord, 'lineas'>>(
        `SELECT id,pedido_id,estado,subtotal::text,gastos_envio::text,impuestos::text,total::text,fecha_ultimo_cambio_estado,transportista,numero_seguimiento,fecha_preparacion,fecha_envio,fecha_entrega_prevista,fecha_entrega_real FROM subpedido WHERE pedido_id=$1 ORDER BY fecha_ultimo_cambio_estado,id`,
        [id],
      ),
    ]);
    const suborderIds = subpedidos.map((suborder) => suborder.id);
    const suborderLines =
      suborderIds.length === 0
        ? []
        : await this.database.query<OrderLine & { subpedido_id: string }>(
            `SELECT subpedido_id,${LINE_COLUMNS} FROM pedido_item WHERE subpedido_id=ANY($1::uuid[]) ORDER BY created_at,id`,
            [suborderIds],
          );
    return {
      ...order,
      lineas,
      subpedidos: subpedidos.map((suborder) => ({
        ...suborder,
        lineas: suborderLines
          .filter((line) => line.subpedido_id === suborder.id)
          .map((line) => this.withoutSuborderId(line)),
      })),
    };
  }

  private withoutSuborderId(line: OrderLine & { subpedido_id: string }): OrderLine {
    return {
      id: line.id,
      vino_id: line.vino_id,
      nombre_vino: line.nombre_vino,
      bodega: line.bodega,
      precio_unitario: line.precio_unitario,
      cantidad: line.cantidad,
      importe_total: line.importe_total,
      ...(line.anada === undefined ? {} : { anada: line.anada }),
    };
  }
}
