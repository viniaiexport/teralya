/* eslint-disable @typescript-eslint/restrict-template-expressions -- el año UTC es una parte numérica deliberada del identificador opaco. */
import { randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";
import { DatabaseService } from "../../common/database/database.service.js";
import type {
  CheckoutRequestDto,
  AddressSnapshot,
  OrderPrepared,
} from "./dto/checkout.dto.js";
type Result =
  | { kind: "ok"; order: OrderPrepared }
  | { kind: "missing" }
  | { kind: "forbidden" }
  | { kind: "validation"; message: string }
  | { kind: "conflict"; message: string };
interface AddressRow {
  propietario_tipo: string;
  propietario_id: string;
  destinatario: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  pais: string;
  empresa: string | null;
  direccion_adicional: string | null;
  provincia: string | null;
  persona_contacto: string | null;
  telefono: string | null;
  email: string | null;
  activa: boolean;
  es_envio: boolean;
  es_facturacion: boolean;
}
interface OrderRow {
  id: string;
  numero_pedido: string;
  estado: string;
  subtotal: string;
  gastos_envio: string;
  impuestos: string;
  descuentos: string;
  total: string;
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
}
@Injectable()
export class CheckoutRepository {
  constructor(private readonly database: DatabaseService) {}
  preparar(owner: string, input: CheckoutRequestDto): Promise<Result> {
    return this.database.withTransaction(async (c) => {
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        `cart:${owner}`,
      ]);
      const carts = await c.query<{
        id: string;
        subtotal: string;
        gastos_envio: string;
        descuentos: string;
        total: string;
      }>(
        "SELECT id,subtotal::text,gastos_envio::text,descuentos::text,total::text FROM carrito WHERE comprador_id=$1 AND estado='activo' FOR UPDATE",
        [owner],
      );
      const cart = carts.rows[0];
      if (cart === undefined) return { kind: "missing" };
      const prior = await c.query<OrderRow>(
        `SELECT id,numero_pedido,estado,subtotal::text,gastos_envio::text,impuestos::text,descuentos::text,total::text,direccion_envio_snapshot,direccion_facturacion_snapshot FROM pedido WHERE carrito_id=$1`,
        [cart.id],
      );
      if (prior.rows[0] !== undefined) {
        if (prior.rows[0].estado !== "pendiente_pago")
          return {
            kind: "conflict",
            message: "El pedido del carrito ya no está pendiente de pago.",
          };
        return { kind: "ok", order: this.order(prior.rows[0]) };
      }
      const items = await c.query<{
        vino_id: string;
        cantidad: number;
        precio_unitario: string;
      }>(
        `SELECT vino_id,cantidad,precio_unitario::text FROM carrito_item WHERE carrito_id=$1 ORDER BY vino_id FOR UPDATE`,
        [cart.id],
      );
      if (items.rows.length === 0)
        return { kind: "validation", message: "El carrito está vacío." };
      for (const item of items.rows) {
        const wines = await c.query<{
          precio: string;
          stock_disponible: number;
          disponible_venta: boolean;
          estado: string;
          bodega_estado: string;
        }>(
          `SELECT v.precio::text,v.stock_disponible,v.disponible_venta,v.estado,b.estado AS bodega_estado FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE v.id=$1 FOR UPDATE OF v`,
          [item.vino_id],
        );
        const wine = wines.rows[0];
        if (
          wine === undefined ||
          wine.estado !== "publicado" ||
          !wine.disponible_venta ||
          !["aprobada", "activa"].includes(wine.bodega_estado) ||
          wine.stock_disponible < item.cantidad ||
          wine.precio !== item.precio_unitario
        )
          return {
            kind: "conflict",
            message:
              "El carrito contiene líneas no elegibles o con precio modificado.",
          };
      }
      const ids = [
        input.direccion_envio_id,
        input.direccion_facturacion_id,
      ].sort();
      await c.query(
        "SELECT id FROM direccion WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [ids],
      );
      const shipping = await this.address(c, input.direccion_envio_id);
      const billing = await this.address(c, input.direccion_facturacion_id);
      if (
        shipping === null ||
        billing === null ||
        !shipping.activa ||
        !billing.activa
      )
        return { kind: "missing" };
      if (
        shipping.propietario_tipo !== "comprador" ||
        shipping.propietario_id !== owner ||
        billing.propietario_tipo !== "comprador" ||
        billing.propietario_id !== owner
      )
        return { kind: "forbidden" };
      if (!shipping.es_envio || !billing.es_facturacion)
        return {
          kind: "validation",
          message: "Las direcciones no tienen el uso requerido.",
        };
      if (!this.validAddress(shipping) || !this.validAddress(billing))
        return {
          kind: "validation",
          message: "Las direcciones contienen datos incompletos.",
        };
      const shippingSnapshot = this.snapshot(shipping),
        billingSnapshot = this.snapshot(billing);
      const numero = `TER-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
      const inserted = await c.query<OrderRow>(
        `INSERT INTO pedido (numero_pedido,comprador_id,carrito_id,subtotal,gastos_envio,impuestos,descuentos,total,direccion_envio_id,direccion_envio_snapshot,direccion_facturacion_id,direccion_facturacion_snapshot,estado) VALUES ($1,$2,$3,$4,$5,0,$6,$7,$8,$9::jsonb,$10,$11::jsonb,'pendiente_pago') RETURNING id,numero_pedido,estado,subtotal::text,gastos_envio::text,impuestos::text,descuentos::text,total::text,direccion_envio_snapshot,direccion_facturacion_snapshot`,
        [
          numero,
          owner,
          cart.id,
          cart.subtotal,
          cart.gastos_envio,
          cart.descuentos,
          cart.total,
          input.direccion_envio_id,
          JSON.stringify(shippingSnapshot),
          input.direccion_facturacion_id,
          JSON.stringify(billingSnapshot),
        ],
      );
      const row = inserted.rows[0];
      if (row === undefined) throw new Error("Pedido no creado.");
      await c.query(
        `INSERT INTO pago (pedido_id,subtotal,gastos_envio,impuestos,comision_marketplace,total_cobrado,total_repartido,total_reembolsado,moneda,estado) VALUES ($1,$2,$3,0,0,$4,0,0,'EUR','pendiente')`,
        [row.id, row.subtotal, row.gastos_envio, row.total],
      );
      await c.query(
        `INSERT INTO auditoria(usuario_id,tipo_entidad,entidad_id,accion,valor_nuevo,descripcion,sistema,resultado) VALUES($1,'pedido',$2,'preparar_checkout',$3::jsonb,'Checkout preparado.','backend','correcto')`,
        [
          owner,
          row.id,
          JSON.stringify({ estado: "pendiente_pago", carrito_id: cart.id }),
        ],
      );
      return { kind: "ok", order: this.order(row) };
    });
  }
  private async address(c: PoolClient, id: string): Promise<AddressRow | null> {
    const r = await c.query<AddressRow>(
      `SELECT propietario_tipo,propietario_id,destinatario,direccion,codigo_postal,ciudad,pais,empresa,direccion_adicional,provincia,persona_contacto,telefono,email,activa,es_envio,es_facturacion FROM direccion WHERE id=$1`,
      [id],
    );
    return r.rows[0] ?? null;
  }
  private validAddress(a: AddressRow): boolean {
    return [
      a.destinatario,
      a.direccion,
      a.codigo_postal,
      a.ciudad,
      a.pais,
    ].every((value) => value.trim().length > 0);
  }
  private snapshot(a: AddressRow): AddressSnapshot {
    return {
      nombre_destinatario: a.destinatario,
      direccion: a.direccion,
      codigo_postal: a.codigo_postal,
      ciudad: a.ciudad,
      pais: a.pais,
      ...this.opt(a, "empresa"),
      ...this.opt(a, "direccion_adicional"),
      ...this.opt(a, "provincia"),
      ...this.opt(a, "persona_contacto"),
      ...this.opt(a, "telefono"),
      ...this.opt(a, "email"),
    };
  }
  private opt(a: AddressRow, k: keyof AddressRow): Record<string, unknown> {
    return a[k] === null ? {} : { [k]: a[k] };
  }
  private order(r: OrderRow): OrderPrepared {
    return {
      id: r.id,
      numero_pedido: r.numero_pedido,
      estado: "pendiente_pago",
      totales: {
        subtotal: r.subtotal,
        gastos_envio: r.gastos_envio,
        impuestos: "0.00",
        descuentos: r.descuentos,
        total: r.total,
        moneda: "EUR",
      },
      direccion_envio_snapshot: r.direccion_envio_snapshot,
      direccion_facturacion_snapshot: r.direccion_facturacion_snapshot,
    };
  }
}
