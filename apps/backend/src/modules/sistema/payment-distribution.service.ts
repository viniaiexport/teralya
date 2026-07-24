import { Inject, Injectable } from "@nestjs/common";
import {
  STRIPE_GATEWAY,
  StripeUnavailableError,
  type StripeGateway,
} from "../checkout/stripe.gateway.js";
import { PaymentDistributionRepository } from "./payment-distribution.repository.js";

@Injectable()
export class PaymentDistributionService {
  constructor(
    private readonly repository: PaymentDistributionRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripe: StripeGateway,
  ) {}

  async distribute(paymentId: string): Promise<void> {
    let sourceTransaction: string | undefined;
    for (;;) {
      const pending = await this.repository.claim(paymentId);
      if (pending === null) break;
      try {
        sourceTransaction ??=
          await this.stripe.retrieveCheckoutSessionCharge(
            pending.stripe_checkout_session_id,
          );
        const transfer = await this.stripe.createTransfer({
          amountCents: this.cents(pending.importe),
          currency: "eur",
          destination: pending.stripe_account_id,
          transferGroup: `TERALYA-${pending.pago_id}`,
          sourceTransaction,
          idempotencyKey: `teralya-transfer-${pending.id}`,
          metadata: {
            pago_id: pending.pago_id,
            subpedido_id: pending.subpedido_id,
            bodega_id: pending.bodega_id,
          },
        });
        await this.repository.transferred(pending.id, transfer);
      } catch (error) {
        await this.repository.failed(
          pending.id,
          error instanceof Error ? error.message : "Error Stripe desconocido.",
        );
        throw error;
      }
    }
    const result = await this.repository.finalize(paymentId);
    if (result !== "complete") {
      throw new StripeUnavailableError(
        "El reparto sigue procesándose y debe reintentarse.",
      );
    }
  }

  private cents(value: string): number {
    const match = /^(\d+)\.(\d{2})$/.exec(value);
    if (match === null) throw new Error("Importe de transferencia inválido.");
    return Number(match[1]) * 100 + Number(match[2]);
  }
}
