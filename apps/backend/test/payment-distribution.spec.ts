import { describe, expect, it, vi } from "vitest";
import type { StripeGateway } from "../src/modules/checkout/stripe.gateway.js";
import type { PaymentDistributionRepository } from "../src/modules/sistema/payment-distribution.repository.js";
import { PaymentDistributionService } from "../src/modules/sistema/payment-distribution.service.js";

const PAYMENT_ID = "11111111-1111-4111-8111-111111111111";
const TRANSFER_ID = "22222222-2222-4222-8222-222222222222";

function setup() {
  const repository = {
    claim: vi
      .fn()
      .mockResolvedValueOnce({
        id: TRANSFER_ID,
        pago_id: PAYMENT_ID,
        subpedido_id: "33333333-3333-4333-8333-333333333333",
        bodega_id: "44444444-4444-4444-8444-444444444444",
        stripe_account_id: "acct_test",
        stripe_checkout_session_id: "cs_test",
        importe: "28.14",
        intentos: 1,
      })
      .mockResolvedValueOnce(null),
    transferred: vi.fn(),
    failed: vi.fn(),
    finalize: vi.fn().mockResolvedValue("complete"),
  };
  const stripe = {
    retrieveCheckoutSessionCharge: vi.fn().mockResolvedValue("ch_test"),
    createTransfer: vi.fn().mockResolvedValue({
      id: "tr_test",
      amountCents: 2814,
      currency: "eur",
      destination: "acct_test",
    }),
  };
  return {
    repository,
    stripe,
    service: new PaymentDistributionService(
      repository as unknown as PaymentDistributionRepository,
      stripe as unknown as StripeGateway,
    ),
  };
}

describe("reparto Stripe Connect", () => {
  it("transfiere céntimos exactos con clave idempotente y finaliza el Pago", async () => {
    const { repository, stripe, service } = setup();

    await service.distribute(PAYMENT_ID);

    expect(stripe.createTransfer).toHaveBeenCalledWith({
      amountCents: 2814,
      currency: "eur",
      destination: "acct_test",
      transferGroup: `TERALYA-${PAYMENT_ID}`,
      sourceTransaction: "ch_test",
      idempotencyKey: `teralya-transfer-${TRANSFER_ID}`,
      metadata: {
        pago_id: PAYMENT_ID,
        subpedido_id: "33333333-3333-4333-8333-333333333333",
        bodega_id: "44444444-4444-4444-8444-444444444444",
      },
    });
    expect(repository.transferred).toHaveBeenCalledWith(
      TRANSFER_ID,
      expect.objectContaining({ id: "tr_test" }),
    );
    expect(repository.finalize).toHaveBeenCalledWith(PAYMENT_ID);
    expect(stripe.retrieveCheckoutSessionCharge).toHaveBeenCalledWith(
      "cs_test",
    );
  });

  it("registra el fallo y permite que el webhook sea reintentable", async () => {
    const { repository, stripe, service } = setup();
    stripe.createTransfer.mockRejectedValueOnce(new Error("Stripe temporal"));

    await expect(service.distribute(PAYMENT_ID)).rejects.toThrow(
      "Stripe temporal",
    );
    expect(repository.failed).toHaveBeenCalledWith(
      TRANSFER_ID,
      "Stripe temporal",
    );
    expect(repository.finalize).not.toHaveBeenCalled();
  });

  it("mantiene el webhook reintentable si queda una transferencia procesando", async () => {
    const { repository, service } = setup();
    repository.claim.mockReset().mockResolvedValue(null);
    repository.finalize.mockResolvedValueOnce("incomplete");

    await expect(service.distribute(PAYMENT_ID)).rejects.toThrow(
      "El reparto sigue procesándose",
    );
  });
});
