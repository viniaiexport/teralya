import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
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
import {
  CheckoutConfirmationService,
  type OrderConfirmationDto,
} from "./checkout-confirmation.service.js";
@Controller("checkout")
@UseGuards(BearerAuthGuard)
@Roles("comprador")
export class CheckoutController {
  constructor(
    private readonly service: CheckoutService,
    private readonly payment: CheckoutPaymentService,
    private readonly confirmation: CheckoutConfirmationService,
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
  @Get("confirmacion/:pedido_id")
  confirmar(
    @CurrentActor() actor: SessionActor,
    @Param("pedido_id") pedidoId: string,
  ): Promise<OrderConfirmationDto> {
    return this.confirmation.obtener(actor.usuarioId, pedidoId);
  }
}
