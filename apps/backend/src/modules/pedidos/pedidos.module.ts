import { Module } from "@nestjs/common";
import { OrderCancellationMailService } from "../../common/notifications/order-cancellation-mail.service.js";
import { CheckoutModule } from "../checkout/checkout.module.js";
import { PedidosController } from "./pedidos.controller.js";
import { PedidosRepository } from "./pedidos.repository.js";
import { PedidosService } from "./pedidos.service.js";

@Module({
  imports: [CheckoutModule],
  controllers: [PedidosController],
  providers: [PedidosRepository, PedidosService, OrderCancellationMailService],
})
export class PedidosModule {}
