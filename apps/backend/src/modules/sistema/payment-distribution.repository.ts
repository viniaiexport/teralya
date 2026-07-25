import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service.js";
import type { StripeTransfer } from "../checkout/stripe.gateway.js";

export interface PendingTransfer {
  id: string;
  pago_id: string;
  subpedido_id: string;
  bodega_id: string;
  stripe_account_id: string;
  stripe_checkout_session_id: string;
  importe: string;
  intentos: number;
}

@Injectable()
export class PaymentDistributionRepository {
  constructor(private readonly database: DatabaseService) {}

  claim(paymentId: string): Promise<PendingTransfer | null> {
    return this.database.withTransaction(async (client) => {
      const rows = await client.query<PendingTransfer>(
        `SELECT t.id,t.pago_id,t.subpedido_id,t.bodega_id,c.stripe_account_id,
                p.stripe_checkout_session_id,
                t.importe::text,t.intentos
           FROM transferencia_stripe t
           JOIN pago p ON p.id=t.pago_id
           JOIN cuenta_stripe_connect c ON c.id=t.cuenta_stripe_connect_id
          WHERE t.pago_id=$1
            AND (
              t.estado IN ('pendiente','fallida')
              OR (t.estado='procesando' AND t.updated_at < now()-interval '10 minutes')
            )
          ORDER BY t.created_at,t.id
          FOR UPDATE OF t SKIP LOCKED
          LIMIT 1`,
        [paymentId],
      );
      const row = rows.rows[0];
      if (row === undefined) return null;
      await client.query(
        `UPDATE transferencia_stripe
            SET estado='procesando',intentos=intentos+1,ultimo_error=NULL,updated_at=now()
          WHERE id=$1`,
        [row.id],
      );
      return { ...row, intentos: row.intentos + 1 };
    });
  }

  async transferred(id: string, transfer: StripeTransfer): Promise<void> {
    await this.database.query(
      `UPDATE transferencia_stripe
          SET estado='transferida',stripe_transfer_id=$2,transferida_at=coalesce(transferida_at,now()),
              ultimo_error=NULL,updated_at=now()
        WHERE id=$1`,
      [id, transfer.id],
    );
  }

  async failed(id: string, error: string): Promise<void> {
    await this.database.query(
      `UPDATE transferencia_stripe
          SET estado='fallida',ultimo_error=$2,updated_at=now()
        WHERE id=$1 AND estado='procesando'`,
      [id, error.slice(0, 500)],
    );
  }

  async finalize(paymentId: string): Promise<"complete" | "incomplete"> {
    return this.database.withTransaction(async (client) => {
      const rows = await client.query<{
        total: number;
        transferred: number;
        amount: string;
      }>(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE estado='transferida')::int AS transferred,
                coalesce(sum(importe) FILTER (WHERE estado='transferida'),0)::text AS amount
           FROM transferencia_stripe
          WHERE pago_id=$1`,
        [paymentId],
      );
      const state = rows.rows[0];
      if (
        state === undefined ||
        state.total === 0 ||
        state.transferred !== state.total
      ) {
        return "incomplete";
      }
      await client.query(
        `UPDATE pago
            SET total_repartido=$2,fecha_liquidacion=coalesce(fecha_liquidacion,now()),
                updated_at=now()
          WHERE id=$1`,
        [paymentId, state.amount],
      );
      return "complete";
    });
  }
}
