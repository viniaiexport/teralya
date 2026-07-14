import { Module } from '@nestjs/common';
import { BodegasController } from './bodegas.controller.js';
import { BodegasRepository } from './bodegas.repository.js';
import { BodegasService } from './bodegas.service.js';

@Module({
  controllers: [BodegasController],
  providers: [BodegasService, BodegasRepository],
})
export class BodegasModule {}
