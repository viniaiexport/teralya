import { Module } from '@nestjs/common';
import { AdminBodegasController } from './admin-bodegas.controller.js';
import { AdminBodegasRepository } from './admin-bodegas.repository.js';
import { AdminBodegasService } from './admin-bodegas.service.js';
import { AdminVinosController } from './admin-vinos.controller.js';
import { AdminVinosRepository } from './admin-vinos.repository.js';
import { AdminVinosService } from './admin-vinos.service.js';
import { AdminIncidenciasController } from './admin-incidencias.controller.js';
import { AdminIncidenciasRepository } from './admin-incidencias.repository.js';
import { AdminIncidenciasService } from './admin-incidencias.service.js';

@Module({
  controllers: [AdminBodegasController, AdminVinosController, AdminIncidenciasController],
  providers: [
    AdminBodegasRepository,
    AdminBodegasService,
    AdminVinosRepository,
    AdminVinosService,
    AdminIncidenciasRepository,
    AdminIncidenciasService,
  ],
})
export class AdminModule {}
