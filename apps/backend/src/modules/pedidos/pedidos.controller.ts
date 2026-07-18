import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentActor, Roles } from "../../common/security/auth.decorators.js";
import { BearerAuthGuard } from "../../common/security/bearer-auth.guard.js";
import type { SessionActor } from "../../common/security/session.service.js";
import {
  OrdersQueryDto,
  type OrderBuyerDetail,
  type OrderCancellationResult,
  type PageOrderSummary,
} from "./dto/pedidos.dto.js";
import { PedidosService } from "./pedidos.service.js";

@Controller("pedidos")
@UseGuards(BearerAuthGuard)
@Roles("comprador")
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Get()
  listar(
    @CurrentActor() actor: SessionActor,
    @Query() query: OrdersQueryDto,
  ): Promise<PageOrderSummary> {
    return this.service.listar(actor.usuarioId, query.page, query.page_size);
  }

  @Get(":id")
  obtener(
    @CurrentActor() actor: SessionActor,
    @Param("id") id: string,
  ): Promise<OrderBuyerDetail> {
    return this.service.obtener(actor.usuarioId, id);
  }

  /** API-051 — POST /pedidos/{id}/cancelacion. */
  @Post(":id/cancelacion")
  @HttpCode(HttpStatus.OK)
  cancelar(
    @CurrentActor() actor: SessionActor,
    @Param("id") id: string,
  ): Promise<OrderCancellationResult> {
    return this.service.cancelar(actor.usuarioId, id);
  }
}
