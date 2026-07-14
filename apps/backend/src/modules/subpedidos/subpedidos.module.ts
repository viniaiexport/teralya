import { Module } from '@nestjs/common';
import { SubpedidosController } from './subpedidos.controller.js';
import { SubpedidosRepository } from './subpedidos.repository.js';
import { SubpedidosService } from './subpedidos.service.js';

@Module({ controllers: [SubpedidosController], providers: [SubpedidosRepository, SubpedidosService] })
export class SubpedidosModule {}
