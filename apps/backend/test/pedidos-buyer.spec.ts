import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { OrderCancellationMailService } from "../src/common/notifications/order-cancellation-mail.service.js";
import type { StripeGateway } from "../src/modules/checkout/stripe.gateway.js";
import type { PedidosRepository } from "../src/modules/pedidos/pedidos.repository.js";
import { PedidosService } from "../src/modules/pedidos/pedidos.service.js";

const ID = "11111111-1111-4111-8111-111111111111";
const DATE = new Date("2026-07-17T00:00:00Z");

function setup() {
  const repository = {
    listar: vi.fn(),
    obtener: vi.fn(),
    prepararCancelacion: vi.fn(),
    aplicarReembolso: vi.fn(),
    reclamarNotificacionCancelacion: vi
      .fn()
      .mockResolvedValue("44444444-4444-4444-8444-444444444444"),
    finalizarNotificacionCancelacion: vi.fn(),
  };
  const stripe = {
    retrieveCheckoutSessionPaymentIntent: vi.fn(),
    createRefund: vi.fn(),
    retrieveRefund: vi.fn(),
  };
  const mail = { send: vi.fn() };
  return {
    repository,
    stripe,
    mail,
    service: new PedidosService(
      repository as unknown as PedidosRepository,
      stripe as unknown as StripeGateway,
      mail as unknown as OrderCancellationMailService,
    ),
  };
}

describe("API-019/API-020 pedidos comprador", () => {
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
          created_at: DATE,
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

  it("proyecta detalle, líneas, snapshots y disponibilidad de cancelación", async () => {
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
        created_at: DATE,
        direccion_envio_snapshot: {},
        direccion_facturacion_snapshot: {},
        lineas: [],
        subpedidos: [
          { id: ID, estado: "pendiente", total: "10.00", moneda: "EUR" },
        ],
        puede_cancelar: true,
        cancelacion: null,
      },
    });
    await expect(service.obtener("u", ID)).resolves.toMatchObject({
      lineas: [],
      puede_cancelar: true,
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

describe("API-051 cancelación contractual", () => {
  const context = {
    cancelacionId: "22222222-2222-4222-8222-222222222222",
    pedidoId: ID,
    numeroPedido: "T-1",
    pagoId: "33333333-3333-4333-8333-333333333333",
    total: "10.00",
    email: "buyer@example.test",
    stripeSessionId: "cs_test_1",
    stripeRefundId: null,
    attempt: 1,
  };
  const completed = {
    pedido_id: ID,
    pedido_estado: "cancelado",
    pago_estado: "reembolsado",
    estado: "completada",
    reembolso_estado: "succeeded",
    solicitada_at: DATE.toISOString(),
    completada_at: DATE.toISOString(),
  } as const;

  it("crea un reembolso idempotente, aplica la cancelación y notifica", async () => {
    const { repository, stripe, mail, service } = setup();
    repository.prepararCancelacion.mockResolvedValue({
      kind: "ready",
      context,
    });
    stripe.retrieveCheckoutSessionPaymentIntent.mockResolvedValue("pi_test_1");
    stripe.createRefund.mockResolvedValue({
      id: "re_test_1",
      paymentIntentId: "pi_test_1",
      status: "succeeded",
    });
    repository.aplicarReembolso.mockResolvedValue(completed);

    await expect(service.cancelar("u", ID)).resolves.toEqual(completed);
    expect(stripe.createRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: "pi_test_1",
        idempotencyKey: `teralya-cancelacion-${ID}-1`,
      }),
    );
    expect(mail.send).toHaveBeenCalledWith(
      context.email,
      context.numeroPedido,
      completed,
    );
    expect(repository.reclamarNotificacionCancelacion).toHaveBeenCalledWith(
      expect.objectContaining({ pedidoId: ID }),
    );
    expect(repository.finalizarNotificacionCancelacion).toHaveBeenCalledWith(
      expect.objectContaining({ emailSent: true }),
    );
  });

  it("consulta el mismo reembolso mientras sigue procesándose y no confirma por email", async () => {
    const { repository, stripe, mail, service } = setup();
    repository.prepararCancelacion.mockResolvedValue({
      kind: "ready",
      context: { ...context, stripeRefundId: "re_pending" },
    });
    stripe.retrieveRefund.mockResolvedValue({
      id: "re_pending",
      paymentIntentId: "pi_test_1",
      status: "pending",
    });
    repository.aplicarReembolso.mockResolvedValue({
      ...completed,
      pedido_estado: "pagado",
      pago_estado: "pagado",
      estado: "procesando",
      reembolso_estado: "pending",
      completada_at: undefined,
    });

    await expect(service.cancelar("u", ID)).resolves.toMatchObject({
      estado: "procesando",
    });
    expect(stripe.createRefund).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it("devuelve el resultado ya completado sin duplicar operaciones económicas", async () => {
    const { repository, stripe, service } = setup();
    repository.prepararCancelacion.mockResolvedValue({
      kind: "completed",
      value: completed,
      notification: {
        cancelacionId: context.cancelacionId,
        pedidoId: ID,
        numeroPedido: context.numeroPedido,
        email: context.email,
      },
    });
    await expect(service.cancelar("u", ID)).resolves.toEqual(completed);
    expect(stripe.createRefund).not.toHaveBeenCalled();
    expect(repository.aplicarReembolso).not.toHaveBeenCalled();
    expect(repository.reclamarNotificacionCancelacion).toHaveBeenCalledTimes(1);
  });

  it("mapea conflicto logístico y fallo de reembolso", async () => {
    const { repository, stripe, service } = setup();
    repository.prepararCancelacion.mockResolvedValueOnce({
      kind: "conflict",
      message: "Enviado",
    });
    await expect(service.cancelar("u", ID)).rejects.toBeInstanceOf(
      ConflictException,
    );

    repository.prepararCancelacion.mockResolvedValueOnce({
      kind: "ready",
      context,
    });
    stripe.retrieveCheckoutSessionPaymentIntent.mockResolvedValue("pi_test_1");
    stripe.createRefund.mockResolvedValue({
      id: "re_failed",
      paymentIntentId: "pi_test_1",
      status: "failed",
    });
    repository.aplicarReembolso.mockResolvedValue({
      ...completed,
      pedido_estado: "pagado",
      pago_estado: "pagado",
      estado: "fallida",
      reembolso_estado: "failed",
      completada_at: undefined,
    });
    await expect(service.cancelar("u", ID)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
