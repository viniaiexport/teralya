import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { OrderCancellationMailService } from "../../common/notifications/order-cancellation-mail.service.js";
import {
  STRIPE_GATEWAY,
  StripeUnavailableError,
  StripeUpstreamError,
  type StripeGateway,
} from "../checkout/stripe.gateway.js";
import type {
  OrderBuyerDetail,
  OrderCancellationResult,
  OrderSummary,
  PageOrderSummary,
} from "./dto/pedidos.dto.js";
import { PedidosRepository } from "./pedidos.repository.js";

@Injectable()
export class PedidosService {
  constructor(
    private readonly repository: PedidosRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripe: StripeGateway,
    private readonly mail: OrderCancellationMailService,
  ) {}

  async listar(
    owner: string,
    page: number,
    pageSize: number,
  ): Promise<PageOrderSummary> {
    const result = await this.repository.listar(owner, page, pageSize);
    return {
      items: result.items.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
      })),
      page,
      page_size: pageSize,
      total_items: result.total,
      total_pages: Math.ceil(result.total / pageSize),
    };
  }

  async obtener(owner: string, id: string): Promise<OrderBuyerDetail> {
    if (!isUUID(id)) this.notFound();
    const result = await this.repository.obtener(owner, id);
    if (result.kind === "missing") this.notFound();
    if (result.kind === "foreign") {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "El pedido pertenece a otro comprador.",
      });
    }
    const r = result.order;
    const summary: OrderSummary = {
      id: r.id,
      numero_pedido: r.numero_pedido,
      estado: r.estado,
      total: r.total,
      moneda: "EUR",
      created_at: new Date(r.created_at).toISOString(),
    };
    return {
      ...summary,
      puede_cancelar: r.puede_cancelar,
      ...(r.cancelacion === null ? {} : { cancelacion: r.cancelacion }),
      totales: {
        subtotal: r.subtotal,
        gastos_envio: r.gastos_envio,
        impuestos: r.impuestos,
        descuentos: r.descuentos,
        total: r.total,
        moneda: "EUR",
      },
      direccion_envio_snapshot: r.direccion_envio_snapshot,
      direccion_facturacion_snapshot: r.direccion_facturacion_snapshot,
      lineas: r.lineas,
    };
  }

  async cancelar(owner: string, id: string): Promise<OrderCancellationResult> {
    if (!isUUID(id)) this.notFound();
    const prepared = await this.repository.prepararCancelacion(owner, id);
    if (prepared.kind === "missing") this.notFound();
    if (prepared.kind === "foreign") {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "El pedido pertenece a otro comprador.",
      });
    }
    if (prepared.kind === "conflict") {
      throw new ConflictException({
        code: "CONFLICT",
        message: prepared.message,
      });
    }
    if (prepared.kind === "completed") {
      await this.notificarCancelacion(
        owner,
        prepared.notification,
        prepared.value,
      );
      return prepared.value;
    }

    const { context } = prepared;
    let refund;
    try {
      if (context.stripeRefundId === null) {
        const paymentIntentId =
          await this.stripe.retrieveCheckoutSessionPaymentIntent(
            context.stripeSessionId,
          );
        refund = await this.stripe.createRefund({
          paymentIntentId,
          idempotencyKey: `teralya-cancelacion-${context.pedidoId}-${String(context.attempt)}`,
          metadata: {
            pedido_id: context.pedidoId,
            pago_id: context.pagoId,
            cancelacion_id: context.cancelacionId,
          },
        });
      } else {
        refund = await this.stripe.retrieveRefund(context.stripeRefundId);
      }
    } catch (error) {
      if (error instanceof StripeUnavailableError) {
        throw new ServiceUnavailableException({
          code: "UPSTREAM_UNAVAILABLE",
          message: "Stripe no está disponible para procesar el reembolso.",
        });
      }
      if (error instanceof StripeUpstreamError) {
        throw new BadGatewayException({
          code: "UPSTREAM_ERROR",
          message: "Stripe rechazó el reembolso.",
        });
      }
      throw error;
    }

    const result = await this.repository.aplicarReembolso(context, refund);
    if (["failed", "canceled"].includes(refund.status)) {
      throw new BadGatewayException({
        code: "UPSTREAM_ERROR",
        message: "El reembolso no pudo procesarse.",
      });
    }

    if (result.estado === "completada") {
      await this.notificarCancelacion(owner, context, result);
    }
    return result;
  }

  private async notificarCancelacion(
    owner: string,
    context: {
      cancelacionId: string;
      pedidoId: string;
      numeroPedido: string;
      email: string;
    },
    result: OrderCancellationResult,
  ): Promise<void> {
    const notificacionId =
      await this.repository.reclamarNotificacionCancelacion({
        usuarioId: owner,
        pedidoId: context.pedidoId,
        numeroPedido: context.numeroPedido,
      });
    if (notificacionId === null) return;

    let emailSent = true;
    try {
      await this.mail.send(context.email, context.numeroPedido, result);
    } catch {
      emailSent = false;
    }
    await this.repository.finalizarNotificacionCancelacion({
      notificacionId,
      emailSent,
    });
  }

  private notFound(): never {
    throw new NotFoundException({
      code: "RESOURCE_NOT_FOUND",
      message: "Pedido no encontrado.",
    });
  }
}
