import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BodegaAuthenticated, CurrentActor, Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { BodegasService } from './bodegas.service.js';
import { BodegaRegistrationRequestDto } from './dto/bodega-registration-request.dto.js';
import type { BodegaSelf } from './dto/bodega-self.dto.js';
import { BodegaProfilePatchDto } from './dto/bodega-profile-patch.dto.js';
import type { BodegaPublic } from './dto/bodega-public.dto.js';

@Controller('bodegas')
export class BodegasController {
  constructor(private readonly bodegasService: BodegasService) {}

  /** API-005 — POST /bodegas (contrato: teralya-openapi-v1.0.yaml). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() body: BodegaRegistrationRequestDto): Promise<BodegaSelf> {
    return this.bodegasService.registrar(body);
  }

  /** API-006 — PATCH /bodegas/yo/perfil. */
  @Patch('yo/perfil')
  @UseGuards(BearerAuthGuard)
  @Roles('bodega')
  @BodegaAuthenticated()
  async actualizarPerfil(
    @CurrentActor() actor: SessionActor,
    @Body() body: BodegaProfilePatchDto,
  ): Promise<BodegaSelf> {
    return this.bodegasService.actualizarPerfilPropio(actor.bodegaId as string, body);
  }

  /** API-031 — GET /bodegas/yo/perfil. */
  @Get('yo/perfil')
  @UseGuards(BearerAuthGuard)
  @Roles('bodega')
  @BodegaAuthenticated()
  async obtenerPerfil(@CurrentActor() actor: SessionActor): Promise<BodegaSelf> {
    return this.bodegasService.obtenerPerfilPropio(actor.bodegaId as string);
  }

  /** API-030 — GET /bodegas/{id}. */
  @Get(':id')
  async obtenerPublica(@Param('id') id: string): Promise<BodegaPublic> {
    return this.bodegasService.obtenerPublica(id);
  }
}
