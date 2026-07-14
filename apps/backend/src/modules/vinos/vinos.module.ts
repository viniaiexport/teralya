import { Module } from '@nestjs/common';
import { VinosController } from './vinos.controller.js';
import { VinosRepository } from './vinos.repository.js';
import { VinosService } from './vinos.service.js';

@Module({ controllers: [VinosController], providers: [VinosRepository, VinosService] })
export class VinosModule {}
