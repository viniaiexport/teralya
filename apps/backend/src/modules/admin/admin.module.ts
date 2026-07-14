import { Module } from '@nestjs/common';
import { AdminBodegasController } from './admin-bodegas.controller.js';
import { AdminBodegasRepository } from './admin-bodegas.repository.js';
import { AdminBodegasService } from './admin-bodegas.service.js';

@Module({
  controllers: [AdminBodegasController],
  providers: [AdminBodegasRepository, AdminBodegasService],
})
export class AdminModule {}
