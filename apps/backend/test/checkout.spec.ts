import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { CheckoutRepository } from "../src/modules/checkout/checkout.repository.js";
import { CheckoutService } from "../src/modules/checkout/checkout.service.js";
const D = "11111111-1111-4111-8111-111111111111";
function setup() {
  const repository = { preparar: vi.fn() };
  return {
    repository,
    service: new CheckoutService(repository as unknown as CheckoutRepository),
  };
}
describe("API016 checkout", () => {
  it("devuelve pedido preparado o replay persistido", async () => {
    const { repository, service } = setup();
    repository.preparar.mockResolvedValue({
      kind: "ok",
      order: {
        id: D,
        numero_pedido: "opaque",
        estado: "pendiente_pago",
        totales: {
          subtotal: "10.00",
          gastos_envio: "0.00",
          impuestos: "0.00",
          descuentos: "0.00",
          total: "10.00",
          moneda: "EUR",
        },
        direccion_envio_snapshot: {},
        direccion_facturacion_snapshot: {},
      },
    });
    await expect(
      service.preparar("u", {
        direccion_envio_id: D,
        direccion_facturacion_id: D,
      }),
    ).resolves.toMatchObject({ estado: "pendiente_pago" });
  });
  it("traduce carrito/dirección ausente y línea no elegible", async () => {
    const { repository, service } = setup();
    repository.preparar
      .mockResolvedValueOnce({ kind: "missing" })
      .mockResolvedValueOnce({ kind: "conflict", message: "precio" });
    await expect(
      service.preparar("u", {
        direccion_envio_id: D,
        direccion_facturacion_id: D,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.preparar("u", {
        direccion_envio_id: D,
        direccion_facturacion_id: D,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it("aplica 400 a datos/uso, 403 a direcciones ajenas", async () => {
    const { repository, service } = setup();
    repository.preparar
      .mockResolvedValueOnce({ kind: "validation", message: "uso" })
      .mockResolvedValueOnce({ kind: "forbidden" });
    const request = { direccion_envio_id: D, direccion_facturacion_id: D };
    await expect(service.preparar("u", request)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.preparar("u", request)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
