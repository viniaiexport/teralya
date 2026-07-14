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
import { AdminPedidosController } from './admin-pedidos.controller.js';
import { AdminPedidosRepository } from './admin-pedidos.repository.js';
import { AdminPedidosService } from './admin-pedidos.service.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AdminDashboardRepository } from './admin-dashboard.repository.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Module({
  controllers: [
    AdminBodegasController,
    AdminVinosController,
    AdminIncidenciasController,
    AdminPedidosController,
    AdminDashboardController,
  ],
  providers: [
    AdminBodegasRepository,
    AdminBodegasService,
    AdminVinosRepository,
    AdminVinosService,
    AdminIncidenciasRepository,
    AdminIncidenciasService,
    AdminPedidosRepository,
    AdminPedidosService,
    AdminDashboardRepository,
    AdminDashboardService,
  ],
})
export class AdminModule {}
