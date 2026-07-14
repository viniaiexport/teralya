import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  ConflictException,
} from "@nestjs/common";
import { CheckoutPaymentRepository } from "./checkout-payment.repository.js";
import type { CheckoutSessionDto } from "./dto/payment-session.dto.js";
import {
  StripeUnavailableError,
  StripeUpstreamError,
} from "./stripe.gateway.js";
@Injectable()
export class CheckoutPaymentService {
  constructor(private readonly repository: CheckoutPaymentRepository) {}
  async crear(owner: string, pedidoId: string): Promise<CheckoutSessionDto> {
    let result;
    try {
      result = await this.repository.crear(owner, pedidoId);
    } catch (error) {
      if (error instanceof StripeUnavailableError)
        throw new ServiceUnavailableException({
          code: "UPSTREAM_UNAVAILABLE",
          message: "Stripe no está disponible.",
        });
      if (error instanceof StripeUpstreamError)
        throw new BadGatewayException({
          code: "UPSTREAM_ERROR",
          message: "Stripe rechazó la operación.",
        });
      throw error;
    }
    if (result.kind === "missing")
      throw new NotFoundException({
        code: "RESOURCE_NOT_FOUND",
        message: "Pedido o pago no encontrado.",
      });
    if (result.kind === "forbidden")
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "El pedido pertenece a otro comprador.",
      });
    if (result.kind === "conflict")
      throw new ConflictException({
        code: "CONFLICT",
        message: result.message,
      });
    return result.value;
  }
}
