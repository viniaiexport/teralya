import { Module } from '@nestjs/common';
import { VinosController } from './vinos.controller.js';
import { VinosRepository } from './vinos.repository.js';
import { VinosService } from './vinos.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogRepository } from './catalog.repository.js';
import { CatalogService } from './catalog.service.js';

@Module({ controllers: [VinosController,CatalogController], providers: [VinosRepository, VinosService,CatalogRepository,CatalogService] })
export class VinosModule {}
