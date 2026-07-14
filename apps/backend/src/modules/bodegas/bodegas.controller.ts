import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BodegasService } from './bodegas.service.js';
import { BodegaRegistrationRequestDto } from './dto/bodega-registration-request.dto.js';
import type { BodegaSelf } from './dto/bodega-self.dto.js';

@Controller('bodegas')
export class BodegasController {
  constructor(private readonly bodegasService: BodegasService) {}

  /** API-005 — POST /bodegas (contrato: teralya-openapi-v1.0.yaml). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() body: BodegaRegistrationRequestDto): Promise<BodegaSelf> {
    return this.bodegasService.registrar(body);
  }
}
