import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { apiRequest, readAccessToken, readSessionIdentity } = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  readAccessToken: vi.fn(),
  readSessionIdentity: vi.fn(),
}));
vi.mock("../src/lib/api/client", () => ({ apiRequest }));
vi.mock("../src/lib/session/session", () => ({
  readAccessToken,
  readSessionIdentity,
}));

import {
  cancelBuyerOrder,
  getBuyerOrder,
  listBuyerOrders,
} from "../src/lib/orders/server";

const orderId = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  vi.clearAllMocks();
  readSessionIdentity.mockResolvedValue({
    usuario_id: "buyer",
    rol: "comprador",
  });
  readAccessToken.mockResolvedValue("opaque-token");
});

describe("contrato de pedidos del comprador FE-007", () => {
  it("consulta únicamente pedidos propios mediante API-019", async () => {
    apiRequest.mockResolvedValue({
      items: [],
      page: 2,
      page_size: 20,
      total_items: 0,
      total_pages: 0,
    });
    await listBuyerOrders(2);
    expect(apiRequest).toHaveBeenCalledWith("/pedidos?page=2&page_size=20", {
      method: "GET",
      token: "opaque-token",
    });
  });

  it("normaliza paginación no válida antes de llamar al backend", async () => {
    apiRequest.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 20,
      total_items: 0,
      total_pages: 0,
    });
    await listBuyerOrders(-4, 500);
    expect(apiRequest).toHaveBeenCalledWith("/pedidos?page=1&page_size=20", {
      method: "GET",
      token: "opaque-token",
    });
  });

  it("consulta el detalle propio mediante API-020", async () => {
    apiRequest.mockResolvedValue({ id: orderId, lineas: [] });
    await getBuyerOrder(orderId);
    expect(apiRequest).toHaveBeenCalledWith(`/pedidos/${orderId}`, {
      method: "GET",
      token: "opaque-token",
    });
  });

  it("cancela el pedido propio mediante API-051", async () => {
    apiRequest.mockResolvedValue({
      pedido_id: orderId,
      pedido_estado: "cancelado",
      pago_estado: "reembolsado",
      estado: "completada",
      reembolso_estado: "succeeded",
      solicitada_at: "2026-07-17T10:00:00.000Z",
      completada_at: "2026-07-17T10:00:01.000Z",
    });
    await cancelBuyerOrder(orderId);
    expect(apiRequest).toHaveBeenCalledWith(`/pedidos/${orderId}/cancelacion`, {
      method: "POST",
      token: "opaque-token",
    });
  });

  it("rechaza identificadores manipulados sin consultar la API", async () => {
    await expect(getBuyerOrder("../admin/pedidos")).rejects.toThrow(
      "Pedido inválido",
    );
    await expect(cancelBuyerOrder("../admin/pedidos")).rejects.toThrow(
      "Pedido inválido",
    );
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("bloquea roles distintos del comprador", async () => {
    readSessionIdentity.mockResolvedValue({
      usuario_id: "winery",
      rol: "bodega",
      bodega_id: "winery-id",
    });
    await expect(listBuyerOrders()).rejects.toThrow("BUYER_SESSION_REQUIRED");
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
