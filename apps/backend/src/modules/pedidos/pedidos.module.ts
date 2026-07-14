import { Module } from "@nestjs/common";
import { PedidosController } from "./pedidos.controller.js";
import { PedidosRepository } from "./pedidos.repository.js";
import { PedidosService } from "./pedidos.service.js";

@Module({
  controllers: [PedidosController],
  providers: [PedidosRepository, PedidosService],
})
export class PedidosModule {}
