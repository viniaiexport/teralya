import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { CheckoutConfirmationRepository } from "../src/modules/checkout/checkout-confirmation.repository.js";
import { CheckoutConfirmationService } from "../src/modules/checkout/checkout-confirmation.service.js";
const ID = "11111111-1111-4111-8111-111111111111";
function setup() {
  const repository = { obtener: vi.fn() };
  return {
    repository,
    service: new CheckoutConfirmationService(
      repository as unknown as CheckoutConfirmationRepository,
    ),
  };
}
describe("API018 confirmación", () => {
  it("solo devuelve confirmación pagada", async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue({
      kind: "found",
      record: {
        pedido_id: ID,
        comprador_id: "u",
        numero_pedido: "N",
        pedido_estado: "pagado",
        pago_estado: "pagado",
        confirmado_at: new Date(),
      },
    });
    await expect(service.obtener("u", ID)).resolves.toMatchObject({
      pago_estado: "pagado",
      pedido_estado: "pagado",
    });
  });
  it("distingue ajeno y confirmación ausente", async () => {
    const { repository, service } = setup();
    repository.obtener
      .mockResolvedValueOnce({ kind: "foreign" })
      .mockResolvedValueOnce({ kind: "missing" });
    await expect(service.obtener("u", ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.obtener("u", ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
