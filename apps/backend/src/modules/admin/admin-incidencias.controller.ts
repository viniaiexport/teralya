import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import { AdminIncidenciasService } from './admin-incidencias.service.js';
import {
  AdminIncidenciasQueryDto,
  IncidentStatePatchDto,
  type IncidentDetailDto,
  type PageIncidentSummaryDto,
} from './dto/admin-incidencias.dto.js';

@Controller('admin/incidencias')
@UseGuards(BearerAuthGuard)
@Roles('administrador')
export class AdminIncidenciasController {
  constructor(private readonly service: AdminIncidenciasService) {}

  @Get()
  listar(@Query() query: AdminIncidenciasQueryDto): Promise<PageIncidentSummaryDto> {
    return this.service.listar(query.estado, query.page, query.page_size);
  }

  @Get(':id')
  obtener(@Param('id') id: string): Promise<IncidentDetailDto> {
    return this.service.obtener(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  actualizar(
    @Param('id') id: string,
    @Body() body: IncidentStatePatchDto,
  ): Promise<IncidentDetailDto> {
    return this.service.actualizar(id, body.estado_destino);
  }
}
