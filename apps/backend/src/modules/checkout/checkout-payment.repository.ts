import { createHash, createHmac } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../common/database/database.service.js";
import type { CheckoutSessionDto } from "./dto/payment-session.dto.js";
import { STRIPE_GATEWAY, type StripeGateway } from "./stripe.gateway.js";
export type PaymentSessionResult =
  | { kind: "ok"; value: CheckoutSessionDto }
  | { kind: "missing" }
  | { kind: "forbidden" }
  | { kind: "conflict"; message: string };
@Injectable()
export class CheckoutPaymentRepository {
  private readonly success: string;
  private readonly cancel: string;
  private readonly ttl: number;
  private readonly metadataSecret: string;
  constructor(
    private readonly database: DatabaseService,
    @Inject(STRIPE_GATEWAY) private readonly stripe: StripeGateway,
    config: ConfigService,
  ) {
    this.success = config.getOrThrow<string>("STRIPE_CHECKOUT_SUCCESS_URL");
    this.cancel = config.getOrThrow<string>("STRIPE_CHECKOUT_CANCEL_URL");
    this.ttl = config.get<number>("STRIPE_CHECKOUT_TTL_SECONDS") ?? 1800;
    this.metadataSecret = config.getOrThrow<string>("STRIPE_WEBHOOK_SECRET");
  }
  crear(owner: string, pedidoId: string): Promise<PaymentSessionResult> {
    return this.database.withTransaction(async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [`payment:${pedidoId}`],
      );
      const orders = await client.query<{
        id: string;
        comprador_id: string;
        estado: string;
        total: string;
      }>(
        `SELECT id,comprador_id,estado,total::text FROM pedido WHERE id=$1 FOR UPDATE`,
        [pedidoId],
      );
      const order = orders.rows[0];
      if (order === undefined) return { kind: "missing" };
      if (order.comprador_id !== owner) return { kind: "forbidden" };
      if (order.estado !== "pendiente_pago")
        return {
          kind: "conflict",
          message: "El pedido no está pendiente de pago.",
        };
      const payments = await client.query<{
        id: string;
        estado: string;
        stripe_checkout_session_id: string | null;
        stripe_checkout_expires_at: Date | string | null;
      }>(
        `SELECT id,estado,stripe_checkout_session_id,stripe_checkout_expires_at FROM pago WHERE pedido_id=$1 FOR UPDATE`,
        [pedidoId],
      );
      const payment = payments.rows[0];
      if (payment === undefined) return { kind: "missing" };
      if (!["pendiente", "cancelado"].includes(payment.estado))
        return {
          kind: "conflict",
          message: "El pago no admite una sesión Checkout.",
        };
      const now = Math.floor(Date.now() / 1000);
      if (
        payment.estado === "pendiente" &&
        payment.stripe_checkout_session_id !== null &&
        payment.stripe_checkout_expires_at !== null &&
        new Date(payment.stripe_checkout_expires_at).getTime() > Date.now()
      ) {
        const existing = await this.stripe.retrieveCheckoutSession(
          payment.stripe_checkout_session_id,
        );
        return {
          kind: "ok",
          value: {
            pedido_id: pedidoId,
            checkout_url: existing.url,
            session_expires_at: new Date(
              payment.stripe_checkout_expires_at,
            ).toISOString(),
            reused: true,
          },
        };
      }
      const generation = payment.stripe_checkout_session_id ?? "initial";
      const amount = this.cents(order.total);
      const metadata = {
        pedido_id: pedidoId,
        pago_id: payment.id,
        currency: "eur",
        amount_cents: String(amount),
      };
      const signature = createHmac("sha256", this.metadataSecret)
        .update(
          [
            metadata.pedido_id,
            metadata.pago_id,
            metadata.currency,
            metadata.amount_cents,
          ].join("|"),
        )
        .digest("hex");
      const session = await this.stripe.createCheckoutSession({
        amountCents: amount,
        currency: "eur",
        expiresAt: now + this.ttl,
        successUrl: this.success,
        cancelUrl: this.cancel,
        idempotencyKey: `checkout-${payment.id}-${createHash("sha256").update(generation).digest("hex").slice(0, 24)}`,
        metadata: { ...metadata, metadata_signature: signature },
      });
      const expiry = new Date(session.expiresAt * 1000);
      await client.query(
        `UPDATE pago SET estado='pendiente',stripe_checkout_session_id=$2,stripe_checkout_expires_at=$3,updated_at=now() WHERE id=$1`,
        [payment.id, session.id, expiry],
      );
      return {
        kind: "ok",
        value: {
          pedido_id: pedidoId,
          checkout_url: session.url,
          session_expires_at: expiry.toISOString(),
          reused: false,
        },
      };
    });
  }
  private cents(value: string): number {
    const match = /^(\d+)\.(\d{2})$/.exec(value);
    if (match === null) throw new Error("Importe de pedido inválido.");
    return Number(match[1]) * 100 + Number(match[2]);
  }
}
