import { Module } from '@nestjs/common';
import { AdminBodegasController } from './admin-bodegas.controller.js';
import { AdminBodegasRepository } from './admin-bodegas.repository.js';
import { AdminBodegasService } from './admin-bodegas.service.js';
import { AdminVinosController } from './admin-vinos.controller.js';
import { AdminVinosRepository } from './admin-vinos.repository.js';
import { AdminVinosService } from './admin-vinos.service.js';

@Module({
  controllers: [AdminBodegasController,AdminVinosController],
  providers: [AdminBodegasRepository, AdminBodegasService,AdminVinosRepository,AdminVinosService],
})
export class AdminModule {}
