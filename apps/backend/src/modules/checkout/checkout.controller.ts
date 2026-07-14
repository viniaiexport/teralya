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
import { CheckoutRequestDto, type OrderPrepared } from "./dto/checkout.dto.js";
@Controller("checkout")
@UseGuards(BearerAuthGuard)
@Roles("comprador")
export class CheckoutController {
  constructor(private readonly service: CheckoutService) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  preparar(
    @CurrentActor() actor: SessionActor,
    @Body() body: CheckoutRequestDto,
  ): Promise<OrderPrepared> {
    return this.service.preparar(actor.usuarioId, body);
  }
}
