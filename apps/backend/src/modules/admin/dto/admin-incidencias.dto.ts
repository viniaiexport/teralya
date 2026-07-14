import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const INCIDENT_STATES = ['abierta', 'en_revision', 'resuelta', 'cerrada'] as const;
export type IncidentState = (typeof INCIDENT_STATES)[number];
export type RelatedResourceType = 'pedido' | 'subpedido' | 'bodega' | 'vino';

export class AdminIncidenciasQueryDto {
  @IsOptional()
  @IsIn(INCIDENT_STATES)
  estado?: IncidentState;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 20;
}

export class IncidentStatePatchDto {
  @IsIn(INCIDENT_STATES)
  estado_destino!: IncidentState;
}

export interface RelatedResourceDto {
  tipo: RelatedResourceType;
  id: string;
}

export interface IncidentSummaryDto {
  id: string;
  tipo: string;
  estado: IncidentState;
  fecha: string;
  recurso_relacionado: RelatedResourceDto;
}

export interface IncidentDetailDto extends IncidentSummaryDto {
  descripcion: string;
  updated_at: string;
}

export interface PageIncidentSummaryDto {
  items: IncidentSummaryDto[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
