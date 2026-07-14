import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import {
  AdminIncidenciasRepository,
  type IncidentRecord,
  type IncidentTransitionResult,
} from './admin-incidencias.repository.js';
import type {
  IncidentDetailDto,
  IncidentState,
  IncidentSummaryDto,
  PageIncidentSummaryDto,
} from './dto/admin-incidencias.dto.js';

@Injectable()
export class AdminIncidenciasService {
  constructor(private readonly repository: AdminIncidenciasRepository) {}

  async listar(
    estado: IncidentState | undefined,
    page: number,
    pageSize: number,
  ): Promise<PageIncidentSummaryDto> {
    const result = await this.repository.listar(estado, page, pageSize);
    return {
      items: result.items.map((row) => this.summary(row)),
      page,
      page_size: pageSize,
      total_items: result.total,
      total_pages: Math.ceil(result.total / pageSize),
    };
  }

  async obtener(id: string): Promise<IncidentDetailDto> {
    this.uuid(id);
    const incident = await this.repository.obtener(id);
    if (incident === null) this.notFound();
    return this.detail(incident);
  }

  async actualizar(id: string, destino: IncidentState): Promise<IncidentDetailDto> {
    this.uuid(id);
    return this.result(await this.repository.transition(id, destino));
  }

  private result(result: IncidentTransitionResult): IncidentDetailDto {
    if (result.kind === 'missing') this.notFound();
    if (result.kind === 'conflict') {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'La transición de estado de la incidencia no está permitida.',
      });
    }
    return this.detail(result.incident);
  }

  private summary(row: IncidentRecord): IncidentSummaryDto {
    return {
      id: row.id,
      tipo: row.tipo,
      estado: row.estado,
      fecha: this.iso(row.fecha),
      recurso_relacionado: { tipo: row.recurso_tipo, id: row.recurso_id },
    };
  }

  private detail(row: IncidentRecord): IncidentDetailDto {
    return {
      ...this.summary(row),
      descripcion: row.descripcion,
      updated_at: this.iso(row.updated_at),
    };
  }

  private iso(value: Date | string): string {
    return new Date(value).toISOString();
  }

  private uuid(id: string): void {
    if (!isUUID(id)) this.notFound();
  }

  private notFound(): never {
    throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'Incidencia no encontrada.' });
  }
}
