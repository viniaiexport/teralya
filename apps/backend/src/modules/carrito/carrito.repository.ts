import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";
import { DatabaseService } from "../../common/database/database.service.js";
import type { LocalCartItemDto } from "./dto/cart-request.dto.js";
import type {
  CartDto,
  CartItemDto,
  CartItemState,
  CartMutationResponse,
  FusionLine,
} from "./dto/cart.dto.js";
type Result<T> =
  | { kind: "ok"; value: T }
  | { kind: "missing" }
  | { kind: "conflict"; message: string };
interface CartRow {
  id: string;
  updated_at: Date | string;
}
interface WineRow {
  id: string;
  nombre_comercial: string;
  precio: string;
  moneda: "EUR";
  disponible_venta: boolean;
  stock_disponible: number;
  estado: string;
  bodega_id: string;
  bodega_nombre: string;
  bodega_estado: string;
  slug: string | null;
  tipo_vino: string | null;
  anada: number | null;
  region: string | null;
  denominacion_origen: string | null;
}
interface ItemRow {
  id: string;
  vino_id: string;
  cantidad: number;
  precio_unitario: string;
  importe_total: string;
  estado: CartItemState;
}
@Injectable()
export class CarritoRepository {
  constructor(private readonly database: DatabaseService) {}
  get(owner: string): Promise<Result<CartDto>> {
    return this.database.withTransaction(async (c) => {
      const rows = await c.query<CartRow>(
        "SELECT id,updated_at FROM carrito WHERE comprador_id=$1 AND estado='activo' FOR UPDATE",
        [owner],
      );
      const cart = rows.rows[0];
      if (cart === undefined) return { kind: "missing" };
      await this.revalidate(c, cart.id);
      return { kind: "ok", value: await this.cart(c, cart.id) };
    });
  }
  add(
    owner: string,
    vinoId: string,
    delta: number,
  ): Promise<Result<CartMutationResponse>> {
    return this.database.withTransaction(async (c) => {
      const cart = await this.ensure(c, owner);
      if (await this.frozen(c, cart.id))
        return {
          kind: "conflict",
          message: "El carrito tiene un pedido pendiente de pago.",
        };
      const wine = await this.wine(c, vinoId);
      if (wine === null) return { kind: "missing" };
      const old = await c.query<ItemRow>(
        "SELECT id,vino_id,cantidad,precio_unitario::text,importe_total::text,estado FROM carrito_item WHERE carrito_id=$1 AND vino_id=$2 FOR UPDATE",
        [cart.id, vinoId],
      );
      const quantity = (old.rows[0]?.cantidad ?? 0) + delta;
      if (
        !this.eligible(wine) ||
        quantity > wine.stock_disponible ||
        quantity > 999
      )
        return {
          kind: "conflict",
          message: "El vino no está disponible en la cantidad solicitada.",
        };
      if (old.rows[0] === undefined)
        await c.query(
          "INSERT INTO carrito_item (carrito_id,vino_id,cantidad,precio_unitario,importe_total,estado) VALUES ($1,$2,$3,$4,$4::numeric*$3::integer,'disponible')",
          [cart.id, vinoId, quantity, wine.precio],
        );
      else
        await c.query(
          "UPDATE carrito_item SET cantidad=$3,importe_total=precio_unitario*$3,estado='disponible' WHERE carrito_id=$1 AND vino_id=$2",
          [cart.id, vinoId, quantity],
        );
      await this.totals(c, cart.id);
      return { kind: "ok", value: { carrito: await this.cart(c, cart.id) } };
    });
  }
  merge(
    owner: string,
    fusionId: string,
    items: LocalCartItemDto[],
  ): Promise<Result<CartMutationResponse>> {
    return this.database.withTransaction(async (c) => {
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        `${owner}:${fusionId}`,
      ]);
      const hash = this.hash(items);
      const saved = await c.query<{
        carrito_id: string;
        payload_hash: string;
        resultado: { carrito: CartDto; lineas: FusionLine[] };
      }>(
        "SELECT carrito_id,payload_hash,resultado FROM carrito_fusion WHERE comprador_id=$1 AND fusion_id=$2",
        [owner, fusionId],
      );
      if (saved.rows[0] !== undefined) {
        if (await this.frozen(c, saved.rows[0].carrito_id))
          return {
            kind: "conflict",
            message: "El carrito tiene un pedido pendiente de pago.",
          };
        return saved.rows[0].payload_hash === hash
          ? {
              kind: "ok",
              value: {
                carrito: saved.rows[0].resultado.carrito,
                fusion: saved.rows[0].resultado.lineas,
              },
            }
          : {
              kind: "conflict",
              message: "fusion_id ya fue usado con otro contenido.",
            };
      }
      const cart = await this.ensure(c, owner);
      if (await this.frozen(c, cart.id))
        return {
          kind: "conflict",
          message: "El carrito tiene un pedido pendiente de pago.",
        };
      const lines: FusionLine[] = [];
      for (const local of [...items].sort((a, b) =>
        a.vino_id.localeCompare(b.vino_id),
      )) {
        const wine = await this.wine(c, local.vino_id);
        if (wine === null || !this.eligible(wine)) {
          lines.push({
            vino_id: local.vino_id,
            estado: "descartada",
            motivo: "vino_no_disponible",
          });
          continue;
        }
        const current = await c.query<ItemRow>(
          "SELECT id,vino_id,cantidad,precio_unitario::text,importe_total::text,estado FROM carrito_item WHERE carrito_id=$1 AND vino_id=$2 FOR UPDATE",
          [cart.id, local.vino_id],
        );
        const previous = current.rows[0]?.cantidad ?? 0;
        const added = Math.min(
          local.cantidad_local,
          Math.max(0, wine.stock_disponible - previous),
          999 - previous,
        );
        if (added <= 0) {
          lines.push({
            vino_id: local.vino_id,
            estado: "descartada",
            cantidad_resultante: previous,
            motivo: "stock_insuficiente",
          });
          continue;
        }
        const quantity = previous + added;
        if (current.rows[0] === undefined)
          await c.query(
            "INSERT INTO carrito_item (carrito_id,vino_id,cantidad,precio_unitario,importe_total,estado) VALUES ($1,$2,$3,$4,$4::numeric*$3::integer,'disponible')",
            [cart.id, local.vino_id, quantity, wine.precio],
          );
        else
          await c.query(
            "UPDATE carrito_item SET cantidad=$3,importe_total=precio_unitario*$3,estado=CASE WHEN precio_unitario=$4 THEN 'disponible' ELSE 'precio_modificado' END WHERE carrito_id=$1 AND vino_id=$2",
            [cart.id, local.vino_id, quantity, wine.precio],
          );
        lines.push({
          vino_id: local.vino_id,
          estado: added === local.cantidad_local ? "fusionada" : "limitada",
          cantidad_resultante: quantity,
          ...(added === local.cantidad_local
            ? {}
            : { motivo: "stock_limitado" }),
        });
      }
      await this.totals(c, cart.id);
      const response = {
        version: "1",
        carrito: await this.cart(c, cart.id),
        lineas: lines,
      };
      await c.query(
        "INSERT INTO carrito_fusion (comprador_id,carrito_id,fusion_id,payload_hash,resultado) VALUES ($1,$2,$3,$4,$5::jsonb)",
        [owner, cart.id, fusionId, hash, JSON.stringify(response)],
      );
      return {
        kind: "ok",
        value: { carrito: response.carrito, fusion: lines },
      };
    });
  }
  patch(
    owner: string,
    itemId: string,
    quantity: number,
  ): Promise<Result<CartDto>> {
    return this.database.withTransaction(async (c) => {
      const cart = await this.ensure(c, owner);
      if (await this.frozen(c, cart.id))
        return {
          kind: "conflict",
          message: "El carrito tiene un pedido pendiente de pago.",
        };
      const item = await c.query<ItemRow>(
        "SELECT id,vino_id,cantidad,precio_unitario::text,importe_total::text,estado FROM carrito_item WHERE id=$1 AND carrito_id=$2 FOR UPDATE",
        [itemId, cart.id],
      );
      const row = item.rows[0];
      if (row === undefined) return { kind: "missing" };
      const wine = await this.wine(c, row.vino_id);
      if (
        wine === null ||
        !this.eligible(wine) ||
        quantity > wine.stock_disponible ||
        wine.precio !== row.precio_unitario
      )
        return {
          kind: "conflict",
          message: "El vino o su precio ya no son elegibles.",
        };
      await c.query(
        "UPDATE carrito_item SET cantidad=$2,importe_total=precio_unitario*$2,estado='disponible' WHERE id=$1",
        [itemId, quantity],
      );
      await this.totals(c, cart.id);
      return { kind: "ok", value: await this.cart(c, cart.id) };
    });
  }
  remove(owner: string, itemId: string): Promise<Result<CartDto>> {
    return this.database.withTransaction(async (c) => {
      const cart = await this.ensure(c, owner);
      if (await this.frozen(c, cart.id))
        return {
          kind: "conflict",
          message: "El carrito tiene un pedido pendiente de pago.",
        };
      const deleted = await c.query(
        "DELETE FROM carrito_item WHERE id=$1 AND carrito_id=$2 RETURNING id",
        [itemId, cart.id],
      );
      if (deleted.rows[0] === undefined) return { kind: "missing" };
      await this.totals(c, cart.id);
      return { kind: "ok", value: await this.cart(c, cart.id) };
    });
  }
  empty(owner: string): Promise<Result<CartDto>> {
    return this.database.withTransaction(async (c) => {
      const cart = await this.ensure(c, owner);
      if (await this.frozen(c, cart.id))
        return {
          kind: "conflict",
          message: "El carrito tiene un pedido pendiente de pago.",
        };
      await c.query("DELETE FROM carrito_item WHERE carrito_id=$1", [cart.id]);
      await this.totals(c, cart.id);
      return { kind: "ok", value: await this.cart(c, cart.id) };
    });
  }
  private async ensure(c: PoolClient, owner: string): Promise<CartRow> {
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      `cart:${owner}`,
    ]);
    let rows = await c.query<CartRow>(
      "SELECT id,updated_at FROM carrito WHERE comprador_id=$1 AND estado='activo' FOR UPDATE",
      [owner],
    );
    if (rows.rows[0] === undefined)
      rows = await c.query<CartRow>(
        "INSERT INTO carrito (comprador_id,estado) VALUES ($1,'activo') RETURNING id,updated_at",
        [owner],
      );
    const row = rows.rows[0];
    if (row === undefined) throw new Error("No se pudo asegurar el carrito.");
    return row;
  }
  private async frozen(c: PoolClient, id: string): Promise<boolean> {
    const r = await c.query(
      "SELECT 1 FROM pedido WHERE carrito_id=$1 AND estado='pendiente_pago' LIMIT 1",
      [id],
    );
    return r.rows[0] !== undefined;
  }
  private async wine(c: PoolClient, id: string): Promise<WineRow | null> {
    const r = await c.query<WineRow>(
      `SELECT v.id,v.nombre_comercial,v.precio::text,v.moneda,v.disponible_venta,v.stock_disponible,v.estado,v.bodega_id,b.nombre_comercial AS bodega_nombre,b.estado AS bodega_estado,v.slug,v.tipo_vino,v.anada,v.region,v.denominacion_origen FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE v.id=$1`,
      [id],
    );
    return r.rows[0] ?? null;
  }
  private eligible(w: WineRow): boolean {
    return (
      w.estado === "publicado" &&
      w.disponible_venta &&
      ["aprobada", "activa"].includes(w.bodega_estado) &&
      Number(w.precio) > 0
    );
  }
  private state(w: WineRow, q: number, snapshot: string): CartItemState {
    return w.estado !== "publicado" ||
      !w.disponible_venta ||
      !["aprobada", "activa"].includes(w.bodega_estado)
      ? "descatalogado"
      : w.stock_disponible < q
        ? "sin_stock"
        : w.precio !== snapshot
          ? "precio_modificado"
          : "disponible";
  }
  private async revalidate(c: PoolClient, id: string): Promise<void> {
    const items = await c.query<ItemRow>(
      "SELECT id,vino_id,cantidad,precio_unitario::text,importe_total::text,estado FROM carrito_item WHERE carrito_id=$1 FOR UPDATE",
      [id],
    );
    for (const item of items.rows) {
      const w = await this.wine(c, item.vino_id);
      if (w !== null)
        await c.query("UPDATE carrito_item SET estado=$2 WHERE id=$1", [
          item.id,
          this.state(w, item.cantidad, item.precio_unitario),
        ]);
    }
    await this.totals(c, id);
  }
  private async totals(c: PoolClient, id: string): Promise<void> {
    await c.query(
      `UPDATE carrito SET num_productos=x.n,num_botellas=x.q,subtotal=x.s,total=x.s+gastos_envio-descuentos,updated_at=now() FROM (SELECT count(*)::int n,coalesce(sum(cantidad),0)::int q,coalesce(sum(importe_total),0)::numeric(10,2) s FROM carrito_item WHERE carrito_id=$1) x WHERE carrito.id=$1`,
      [id],
    );
  }
  private async cart(c: PoolClient, id: string): Promise<CartDto> {
    const cr = await c.query<{
      id: string;
      num_productos: number;
      num_botellas: number;
      subtotal: string;
      gastos_envio: string;
      descuentos: string;
      total: string;
      updated_at: Date | string;
    }>(
      "SELECT id,num_productos,num_botellas,subtotal::text,gastos_envio::text,descuentos::text,total::text,updated_at FROM carrito WHERE id=$1",
      [id],
    );
    const row = cr.rows[0];
    if (row === undefined) throw new Error("Carrito ausente.");
    const ir = await c.query<ItemRow>(
      "SELECT id,vino_id,cantidad,precio_unitario::text,importe_total::text,estado FROM carrito_item WHERE carrito_id=$1 ORDER BY created_at,id",
      [id],
    );
    const items: CartItemDto[] = [];
    for (const item of ir.rows) {
      const w = await this.wine(c, item.vino_id);
      if (w === null) continue;
      items.push({
        id: item.id,
        vino: {
          id: w.id,
          nombre_comercial: w.nombre_comercial,
          precio: w.precio,
          moneda: w.moneda,
          disponible_venta: w.disponible_venta,
          bodega: { id: w.bodega_id, nombre_comercial: w.bodega_nombre },
          ...(w.slug === null ? {} : { slug: w.slug }),
          ...(w.tipo_vino === null ? {} : { tipo_vino: w.tipo_vino }),
          ...(w.anada === null ? {} : { anada: w.anada }),
          ...(w.region === null ? {} : { region: w.region }),
          ...(w.denominacion_origen === null
            ? {}
            : { denominacion_origen: w.denominacion_origen }),
        },
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        importe_total: item.importe_total,
        estado: item.estado,
      });
    }
    return {
      id: row.id,
      estado: "activo",
      items,
      num_productos: row.num_productos,
      num_botellas: row.num_botellas,
      subtotal: row.subtotal,
      gastos_envio: row.gastos_envio,
      descuentos: row.descuentos,
      total: row.total,
      moneda: "EUR",
      updated_at: new Date(row.updated_at).toISOString(),
    };
  }
  private hash(items: LocalCartItemDto[]): string {
    const canonical = [...items]
      .sort((a, b) => a.vino_id.localeCompare(b.vino_id))
      .map((i) => ({ vino_id: i.vino_id, cantidad_local: i.cantidad_local }));
    return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  }
}
