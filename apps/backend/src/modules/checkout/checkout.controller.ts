import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentActor, Roles } from "../../common/security/auth.decorators.js";
import { BearerAuthGuard } from "../../common/security/bearer-auth.guard.js";
import type { SessionActor } from "../../common/security/session.service.js";
import { CheckoutService } from "./checkout.service.js";
import { CheckoutPaymentService } from "./checkout-payment.service.js";
import {
  CheckoutSessionRequestDto,
  type CheckoutSessionDto,
} from "./dto/payment-session.dto.js";
import { CheckoutRequestDto, type OrderPrepared } from "./dto/checkout.dto.js";
@Controller("checkout")
@UseGuards(BearerAuthGuard)
@Roles("comprador")
export class CheckoutController {
  constructor(
    private readonly service: CheckoutService,
    private readonly payment: CheckoutPaymentService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  preparar(
    @CurrentActor() actor: SessionActor,
    @Body() body: CheckoutRequestDto,
  ): Promise<OrderPrepared> {
    return this.service.preparar(actor.usuarioId, body);
  }
  @Post("pago")
  @HttpCode(HttpStatus.OK)
  crearPago(
    @CurrentActor() actor: SessionActor,
    @Body() body: CheckoutSessionRequestDto,
  ): Promise<CheckoutSessionDto> {
    return this.payment.crear(actor.usuarioId, body.pedido_id);
  }
}
