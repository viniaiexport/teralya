import { Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";
import { DatabaseService } from "../../common/database/database.service.js";
import type { AddressSnapshot } from "../checkout/dto/checkout.dto.js";
import type {
  StripeRefund,
  StripeRefundStatus,
} from "../checkout/stripe.gateway.js";
import type {
  BuyerSubOrderSummary,
  OrderCancellationResult,
  OrderCancellationStatus,
  OrderCancellationSummary,
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
  puede_cancelar: boolean;
  cancelacion: OrderCancellationSummary | null;
}

interface CancellationRecord {
  id: string;
  estado: OrderCancellationStatus;
  stripe_refund_id: string | null;
  stripe_refund_status: StripeRefundStatus | null;
  solicitada_at: Date | string;
  completada_at: Date | string | null;
  intentos: number;
}

interface CancellationNotificationContext {
  cancelacionId: string;
  pedidoId: string;
  numeroPedido: string;
  email: string;
}

interface CancellationContext extends CancellationNotificationContext {
  pagoId: string;
  total: string;
  stripeSessionId: string;
  stripeRefundId: string | null;
  attempt: number;
}

interface CancellationOrderRow {
  id: string;
  numero_pedido: string;
  comprador_id: string;
  estado: OrderState;
  total: string;
  pago_id: string;
  pago_estado:
    | "pagado"
    | "reembolsado"
    | "pendiente"
    | "autorizado"
    | "parcialmente_reembolsado"
    | "fallido"
    | "cancelado";
  stripe_checkout_session_id: string | null;
  email: string;
}

export type OwnedOrder =
  | { kind: "found"; order: OrderRecord }
  | { kind: "foreign" }
  | { kind: "missing" };

export type PrepareCancellationResult =
  | { kind: "ready"; context: CancellationContext }
  | {
      kind: "completed";
      value: OrderCancellationResult;
      notification: CancellationNotificationContext;
    }
  | { kind: "foreign" }
  | { kind: "missing" }
  | { kind: "conflict"; message: string };

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
      | "puede_cancelar"
      | "cancelacion"
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
        `SELECT id,numero_pedido,estado,total::text,'EUR'::text AS moneda,created_at
           FROM pedido
          WHERE comprador_id=$1
          ORDER BY created_at DESC,id DESC
          LIMIT $2 OFFSET $3`,
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
      Omit<
        OrderRecord,
        "lineas" | "subpedidos" | "puede_cancelar" | "cancelacion"
      >
    >(
      `SELECT id,numero_pedido,comprador_id,estado,subtotal::text,gastos_envio::text,
              impuestos::text,descuentos::text,total::text,'EUR'::text AS moneda,
              created_at,direccion_envio_snapshot,direccion_facturacion_snapshot
         FROM pedido
        WHERE id=$1`,
      [id],
    );
    const order = rows[0];
    if (order === undefined) return { kind: "missing" };
    if (order.comprador_id !== owner) return { kind: "foreign" };

    const [lineas, subpedidos, cancelaciones] = await Promise.all([
      this.database.query<OrderLine>(
        `SELECT id,vino_id,nombre_vino_snapshot AS nombre_vino,bodega_snapshot AS bodega,
                precio_unitario::text,cantidad,importe_total::text,anada_snapshot AS anada
           FROM pedido_item
          WHERE pedido_id=$1
          ORDER BY created_at,id`,
        [id],
      ),
      this.database.query<BuyerSubOrderSummary>(
        `SELECT id,estado,total::text,'EUR'::text AS moneda
           FROM subpedido
          WHERE pedido_id=$1
          ORDER BY fecha_ultimo_cambio_estado,id`,
        [id],
      ),
      this.database.query<CancellationRecord>(
        `SELECT id,estado,stripe_refund_id,stripe_refund_status,solicitada_at,completada_at,intentos
           FROM cancelacion_pedido
          WHERE pedido_id=$1`,
        [id],
      ),
    ]);
    const cancelacion = cancelaciones[0] ?? null;
    const puedeCancelar =
      (cancelacion === null || cancelacion.estado === "fallida") &&
      ["pagado", "en_preparacion"].includes(order.estado) &&
      subpedidos.some((row) => row.estado !== "cancelado") &&
      subpedidos.every((row) =>
        ["pendiente", "aceptado", "en_preparacion", "cancelado"].includes(
          row.estado,
        ),
      );
    return {
      kind: "found",
      order: {
        ...order,
        lineas,
        subpedidos,
        puede_cancelar: puedeCancelar,
        cancelacion:
          cancelacion === null ? null : this.mapCancellation(cancelacion),
      },
    };
  }

  async prepararCancelacion(
    owner: string,
    id: string,
  ): Promise<PrepareCancellationResult> {
    return this.database.withTransaction(async (client) => {
      const rows = await client.query<CancellationOrderRow>(
        `SELECT p.id,p.numero_pedido,p.comprador_id,p.estado,p.total::text,
                pg.id AS pago_id,pg.estado AS pago_estado,pg.stripe_checkout_session_id,
                u.email
           FROM pedido p
           JOIN pago pg ON pg.pedido_id=p.id
           JOIN usuario u ON u.id=p.comprador_id
          WHERE p.id=$1
          FOR UPDATE OF p,pg`,
        [id],
      );
      const order = rows.rows[0];
      if (order === undefined) return { kind: "missing" };
      if (order.comprador_id !== owner) return { kind: "foreign" };

      const existingRows = await client.query<CancellationRecord>(
        `SELECT id,estado,stripe_refund_id,stripe_refund_status,solicitada_at,completada_at,intentos
           FROM cancelacion_pedido
          WHERE pedido_id=$1
          FOR UPDATE`,
        [id],
      );
      const existing = existingRows.rows[0];
      if (existing?.estado === "completada") {
        return {
          kind: "completed",
          value: this.cancellationResult(order, existing),
          notification: {
            cancelacionId: existing.id,
            pedidoId: order.id,
            numeroPedido: order.numero_pedido,
            email: order.email,
          },
        };
      }

      if (!["pagado", "en_preparacion"].includes(order.estado)) {
        return {
          kind: "conflict",
          message: "El pedido ya no admite cancelación directa.",
        };
      }
      if (order.pago_estado !== "pagado") {
        return {
          kind: "conflict",
          message: "El pago no está en un estado reembolsable.",
        };
      }
      if (order.stripe_checkout_session_id === null) {
        return {
          kind: "conflict",
          message: "El pago no dispone de una referencia Stripe reembolsable.",
        };
      }

      const logistics = await client.query<{
        total: number;
        active: number;
        blocked: number;
      }>(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE estado <> 'cancelado')::int AS active,
                count(*) FILTER (WHERE estado IN ('enviado','entregado','incidencia'))::int AS blocked
           FROM subpedido
          WHERE pedido_id=$1`,
        [id],
      );
      const logisticsState = logistics.rows[0];
      if (
        logisticsState === undefined ||
        logisticsState.total === 0 ||
        logisticsState.active === 0 ||
        logisticsState.blocked > 0
      ) {
        return {
          kind: "conflict",
          message:
            "El pedido ya contiene expedición, incidencia o no tiene operativa cancelable.",
        };
      }

      const cancellation =
        existing?.estado === "fallida"
          ? (
              await client.query<CancellationRecord>(
                `UPDATE cancelacion_pedido
                SET estado='procesando',stripe_refund_id=NULL,stripe_refund_status=NULL,
                    intentos=intentos+1,ultimo_error=NULL,updated_at=now()
              WHERE id=$1
              RETURNING id,estado,stripe_refund_id,stripe_refund_status,
                        solicitada_at,completada_at,intentos`,
                [existing.id],
              )
            ).rows[0]
          : (existing ??
            (
              await client.query<CancellationRecord>(
                `INSERT INTO cancelacion_pedido(
               pedido_id,pago_id,usuario_id,estado,importe,intentos,solicitada_at,updated_at
             ) VALUES($1,$2,$3,'procesando',$4,1,now(),now())
             RETURNING id,estado,stripe_refund_id,stripe_refund_status,
                       solicitada_at,completada_at,intentos`,
                [id, order.pago_id, owner, order.total],
              )
            ).rows[0]);
      if (cancellation === undefined) {
        throw new Error("No se pudo registrar la cancelación.");
      }
      return {
        kind: "ready",
        context: {
          cancelacionId: cancellation.id,
          pedidoId: order.id,
          numeroPedido: order.numero_pedido,
          pagoId: order.pago_id,
          total: order.total,
          email: order.email,
          stripeSessionId: order.stripe_checkout_session_id,
          stripeRefundId: cancellation.stripe_refund_id,
          attempt: cancellation.intentos,
        },
      };
    });
  }

  async aplicarReembolso(
    context: CancellationContext,
    refund: StripeRefund,
  ): Promise<OrderCancellationResult> {
    return this.database.withTransaction(async (client) => {
      const cancellationRows = await client.query<CancellationRecord>(
        `SELECT id,estado,stripe_refund_id,stripe_refund_status,solicitada_at,completada_at,intentos
           FROM cancelacion_pedido
          WHERE id=$1
          FOR UPDATE`,
        [context.cancelacionId],
      );
      const cancellation = cancellationRows.rows[0];
      if (cancellation === undefined) {
        throw new Error("La cancelación registrada ya no existe.");
      }

      const orderRows = await client.query<CancellationOrderRow>(
        `SELECT p.id,p.numero_pedido,p.comprador_id,p.estado,p.total::text,
                pg.id AS pago_id,pg.estado AS pago_estado,pg.stripe_checkout_session_id,
                u.email
           FROM pedido p
           JOIN pago pg ON pg.pedido_id=p.id
           JOIN usuario u ON u.id=p.comprador_id
          WHERE p.id=$1
          FOR UPDATE OF p,pg`,
        [context.pedidoId],
      );
      const order = orderRows.rows[0];
      if (order === undefined) throw new Error("El pedido ya no existe.");

      const accepted = ["pending", "requires_action", "succeeded"].includes(
        refund.status,
      );
      if (refund.status === "succeeded" && order.estado !== "cancelado") {
        await this.cancelCommercialState(client, order, context.cancelacionId);
        order.estado = "cancelado";
      }

      const cancellationState: OrderCancellationStatus =
        refund.status === "succeeded"
          ? "completada"
          : accepted
            ? "procesando"
            : "fallida";
      const updatedRows = await client.query<CancellationRecord>(
        `UPDATE cancelacion_pedido
            SET estado=$2::estado_cancelacion_pedido,
                stripe_refund_id=$3,
                stripe_refund_status=$4,
                completada_at=CASE WHEN $2::text='completada' THEN coalesce(completada_at,now()) ELSE completada_at END,
                ultimo_error=CASE WHEN $2::text='fallida' THEN $5 ELSE NULL END,
                updated_at=now()
          WHERE id=$1
          RETURNING id,estado,stripe_refund_id,stripe_refund_status,
                    solicitada_at,completada_at,intentos`,
        [
          context.cancelacionId,
          cancellationState,
          refund.id,
          refund.status,
          ["failed", "canceled"].includes(refund.status)
            ? "Stripe no completó el reembolso."
            : null,
        ],
      );
      const updatedCancellation = updatedRows.rows[0];
      if (updatedCancellation === undefined) {
        throw new Error("No se pudo actualizar la cancelación.");
      }

      if (refund.status === "succeeded") {
        await client.query(
          `UPDATE pago
              SET estado='reembolsado',total_reembolsado=total_cobrado,
                  fecha_reembolso=coalesce(fecha_reembolso,now()),updated_at=now()
            WHERE id=$1`,
          [context.pagoId],
        );
        order.pago_estado = "reembolsado";
      }

      return this.cancellationResult(order, updatedCancellation);
    });
  }

  async reclamarNotificacionCancelacion(input: {
    usuarioId: string;
    pedidoId: string;
    numeroPedido: string;
  }): Promise<string | null> {
    const rows = await this.database.query<{ id: string }>(
      `INSERT INTO notificacion(
         usuario_id,tipo_notificacion,asunto,contenido,canal,estado,pedido_id,
         evento_origen,updated_at
       ) VALUES($1,'cancelacion_pedido',$2,$3,'email','pendiente',$4,'API-051',now())
       ON CONFLICT (pedido_id,evento_origen) WHERE evento_origen='API-051'
       DO UPDATE SET estado='pendiente',contenido=EXCLUDED.contenido,updated_at=now()
         WHERE notificacion.estado='fallida'
            OR (notificacion.estado='pendiente'
                AND notificacion.updated_at < now() - interval '10 minutes')
       RETURNING id`,
      [
        input.usuarioId,
        `Cancelación del pedido ${input.numeroPedido}`,
        "Cancelación confirmada; pendiente de enviar la notificación por email.",
        input.pedidoId,
      ],
    );
    return rows[0]?.id ?? null;
  }

  async finalizarNotificacionCancelacion(input: {
    notificacionId: string;
    emailSent: boolean;
  }): Promise<void> {
    await this.database.query(
      `UPDATE notificacion
          SET estado=$2::estado_notificacion,
              contenido=$3,
              fecha_envio=CASE WHEN $2::text='enviada' THEN now() ELSE NULL END,
              updated_at=now()
        WHERE id=$1`,
      [
        input.notificacionId,
        input.emailSent ? "enviada" : "fallida",
        input.emailSent
          ? "Cancelación registrada y reembolso confirmado."
          : "La cancelación se registró, pero el correo no pudo enviarse.",
      ],
    );
  }

  private async cancelCommercialState(
    client: PoolClient,
    order: CancellationOrderRow,
    cancellationId: string,
  ): Promise<void> {
    const lines = await client.query<{ vino_id: string; cantidad: number }>(
      `SELECT vino_id,cantidad
         FROM pedido_item
        WHERE pedido_id=$1 AND estado='normal'
        ORDER BY vino_id
        FOR UPDATE`,
      [order.id],
    );
    for (const line of lines.rows) {
      await client.query(
        `UPDATE vino
            SET stock_disponible=stock_disponible+$2,updated_at=now()
          WHERE id=$1`,
        [line.vino_id, line.cantidad],
      );
    }
    await client.query(
      `UPDATE pedido_item SET estado='cancelado',updated_at=now()
        WHERE pedido_id=$1 AND estado='normal'`,
      [order.id],
    );
    await client.query(
      `UPDATE subpedido
          SET estado='cancelado',fecha_ultimo_cambio_estado=now(),updated_at=now()
        WHERE pedido_id=$1 AND estado IN ('pendiente','aceptado','en_preparacion')`,
      [order.id],
    );
    await client.query(
      `UPDATE pedido
          SET estado='cancelado',fecha_cierre=coalesce(fecha_cierre,now()),updated_at=now()
        WHERE id=$1`,
      [order.id],
    );
    await client.query(
      `INSERT INTO auditoria(
         usuario_id,tipo_entidad,entidad_id,accion,valor_anterior,valor_nuevo,
         descripcion,sistema,resultado
       ) VALUES($1,'pedido',$2,'cancelacion_contrato',
                jsonb_build_object('estado',$3::text),
                jsonb_build_object('estado','cancelado','cancelacion_id',$4::text),
                'Cancelación contractual directa con restitución de stock.',
                'backend','correcto')`,
      [order.comprador_id, order.id, order.estado, cancellationId],
    );
  }

  private cancellationResult(
    order: CancellationOrderRow,
    cancellation: CancellationRecord,
  ): OrderCancellationResult {
    const summary = this.mapCancellation(cancellation);
    return {
      pedido_id: order.id,
      pedido_estado: order.estado,
      pago_estado:
        order.pago_estado === "reembolsado" ? "reembolsado" : "pagado",
      ...summary,
    };
  }

  private mapCancellation(
    cancellation: CancellationRecord,
  ): OrderCancellationSummary {
    return {
      estado: cancellation.estado,
      reembolso_estado: cancellation.stripe_refund_status,
      intentos: cancellation.intentos,
      solicitada_at: new Date(cancellation.solicitada_at).toISOString(),
      completada_at:
        cancellation.completada_at === null
          ? null
          : new Date(cancellation.completada_at).toISOString(),
    };
  }
}
