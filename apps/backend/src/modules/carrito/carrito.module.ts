import { Module } from '@nestjs/common';
import { CarritoController } from './carrito.controller.js';
import { CarritoRepository } from './carrito.repository.js';
import { CarritoService } from './carrito.service.js';

@Module({controllers:[CarritoController],providers:[CarritoRepository,CarritoService]})
export class CarritoModule {}
