import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { CheckoutPaymentRepository } from "../src/modules/checkout/checkout-payment.repository.js";
import { CheckoutPaymentService } from "../src/modules/checkout/checkout-payment.service.js";
import {
  StripeUnavailableError,
  StripeUpstreamError,
} from "../src/modules/checkout/stripe.gateway.js";
const ID = "11111111-1111-4111-8111-111111111111";
function setup() {
  const repository = { crear: vi.fn() };
  return {
    repository,
    service: new CheckoutPaymentService(
      repository as unknown as CheckoutPaymentRepository,
    ),
  };
}
describe("API017 sesión Stripe", () => {
  it("devuelve nueva o reutilizada", async () => {
    const { repository, service } = setup();
    repository.crear.mockResolvedValue({
      kind: "ok",
      value: {
        pedido_id: ID,
        checkout_url: "https://checkout.test",
        session_expires_at: new Date().toISOString(),
        reused: true,
      },
    });
    await expect(service.crear("u", ID)).resolves.toMatchObject({
      pedido_id: ID,
      reused: true,
    });
  });
  it("mapea ownership, ausencia y estados", async () => {
    const { repository, service } = setup();
    repository.crear
      .mockResolvedValueOnce({ kind: "missing" })
      .mockResolvedValueOnce({ kind: "forbidden" })
      .mockResolvedValueOnce({ kind: "conflict", message: "estado" });
    await expect(service.crear("u", ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.crear("u", ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.crear("u", ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it("mapea fallos upstream a 502/503", async () => {
    const { repository, service } = setup();
    repository.crear
      .mockRejectedValueOnce(new StripeUpstreamError())
      .mockRejectedValueOnce(new StripeUnavailableError());
    await expect(service.crear("u", ID)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    await expect(service.crear("u", ID)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
