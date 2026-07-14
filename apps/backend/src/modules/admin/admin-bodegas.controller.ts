import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentActor, Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { AdminBodegasService } from './admin-bodegas.service.js';
import { AdminBodegasQueryDto } from './dto/admin-bodegas-query.dto.js';
import type { BodegaAdmin, PageBodegaAdminSummary } from './dto/bodega-admin.dto.js';

@Controller('admin/bodegas')
@UseGuards(BearerAuthGuard)
@Roles('administrador')
export class AdminBodegasController {
  constructor(private readonly service: AdminBodegasService) {}

  /** API-035 — GET /admin/bodegas. */
  @Get()
  async listar(@Query() query: AdminBodegasQueryDto): Promise<PageBodegaAdminSummary> {
    return this.service.listarPendientes(query.page, query.page_size);
  }

  /** API-036 — GET /admin/bodegas/:id. UUID inválidos son recursos inexistentes por contrato. */
  @Get(':id')
  async obtenerDetalle(@Param('id') id: string): Promise<BodegaAdmin> {
    return this.service.obtenerDetalle(id);
  }

  /** API-024 — POST /admin/bodegas/:id/validar. */
  @Post(':id/validar')
  @HttpCode(HttpStatus.OK)
  async validar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentActor() actor: SessionActor,
  ): Promise<BodegaAdmin> {
    return this.service.validar(id, actor.usuarioId);
  }
}
