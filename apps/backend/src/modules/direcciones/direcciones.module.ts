import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { SecurityModule } from '../../common/security/security.module.js';
import { DireccionesController } from './direcciones.controller.js';
import { DireccionesRepository } from './direcciones.repository.js';
import { DireccionesService } from './direcciones.service.js';

@Module({ imports: [DatabaseModule, SecurityModule], controllers: [DireccionesController], providers: [DireccionesRepository, DireccionesService] })
export class DireccionesModule {}
