import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { PedidosRepository } from "../src/modules/pedidos/pedidos.repository.js";
import { PedidosService } from "../src/modules/pedidos/pedidos.service.js";
const ID = "11111111-1111-4111-8111-111111111111";
function setup() {
  const repository = { listar: vi.fn(), obtener: vi.fn() };
  return {
    repository,
    service: new PedidosService(repository as unknown as PedidosRepository),
  };
}
describe("API019/020 pedidos comprador", () => {
  it("pagina estable y proyecta resumen", async () => {
    const { repository, service } = setup();
    repository.listar.mockResolvedValue({
      items: [
        {
          id: ID,
          numero_pedido: "N",
          estado: "pagado",
          total: "10.00",
          moneda: "EUR",
          created_at: new Date(),
        },
      ],
      total: 21,
    });
    await expect(service.listar("u", 2, 20)).resolves.toMatchObject({
      page: 2,
      total_items: 21,
      total_pages: 2,
    });
  });
  it("proyecta detalle, líneas, snapshots y subpedidos", async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue({
      kind: "found",
      order: {
        id: ID,
        numero_pedido: "N",
        comprador_id: "u",
        estado: "pagado",
        subtotal: "10.00",
        gastos_envio: "0.00",
        impuestos: "0.00",
        descuentos: "0.00",
        total: "10.00",
        moneda: "EUR",
        created_at: new Date(),
        direccion_envio_snapshot: {},
        direccion_facturacion_snapshot: {},
        lineas: [],
        subpedidos: [
          { id: ID, estado: "pendiente", total: "10.00", moneda: "EUR" },
        ],
      },
    });
    await expect(service.obtener("u", ID)).resolves.toMatchObject({
      lineas: [],
      subpedidos: [{ id: ID }],
    });
  });
  it("distingue ajeno 403 e inexistente 404", async () => {
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

