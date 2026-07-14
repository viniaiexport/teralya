import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminBodegasRepository, type BodegaAdminRecord } from './admin-bodegas.repository.js';
import type { BodegaAdmin, BodegaAdminSummary, PageBodegaAdminSummary } from './dto/bodega-admin.dto.js';

@Injectable()
export class AdminBodegasService {
  constructor(private readonly repository: AdminBodegasRepository) {}

  async listarPendientes(page: number, pageSize: number): Promise<PageBodegaAdminSummary> {
    const result = await this.repository.listarPendientes(page, pageSize);
    return {
      items: result.items.map((record) => this.mapSummary(record)),
      page,
      page_size: pageSize,
      total_items: result.totalItems,
      total_pages: Math.ceil(result.totalItems / pageSize),
    };
  }

  async obtenerDetalle(id: string): Promise<BodegaAdmin> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw this.notFound();
    }
    const bodega = await this.repository.obtenerDetalle(id);
    if (bodega === null) throw this.notFound();
    return this.mapBodega(bodega);
  }

  async validar(id: string, administradorId: string): Promise<BodegaAdmin> {
    const result = await this.repository.validar(id, administradorId);
    if (result.kind === 'not_found') {
      throw this.notFound();
    }
    if (result.kind === 'invalid_state') {
      throw new ConflictException({ code: 'CONFLICT', message: 'La bodega no está pendiente de revisión.' });
    }
    if (result.kind === 'incomplete') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'La bodega no contiene los datos mínimos de alta.' });
    }
    return this.mapBodega(result.bodega);
  }

  private mapSummary(record: BodegaAdminRecord): BodegaAdminSummary {
    return {
      id: record.id,
      nombre_comercial: record.nombre_comercial,
      estado: record.estado,
      created_at: this.iso(record.created_at),
      ...(record.razon_social === null ? {} : { razon_social: record.razon_social }),
      ...(record.cif_vat === null ? {} : { cif_vat: record.cif_vat }),
      ...(record.pais_contacto === null ? {} : { pais_contacto: record.pais_contacto }),
    };
  }

  private notFound(): NotFoundException {
    return new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'La bodega no existe.' });
  }

  private mapBodega(record: BodegaAdminRecord): BodegaAdmin {
    const optional = (key: keyof BodegaAdminRecord): Partial<BodegaAdmin> =>
      record[key] === null ? {} : { [key]: record[key] };
    return {
      id: record.id,
      nombre_comercial: record.nombre_comercial,
      estado: record.estado,
      created_at: this.iso(record.created_at),
      updated_at: this.iso(record.updated_at),
      ...optional('slug'), ...optional('logo_url'), ...optional('imagen_principal_url'),
      ...optional('historia'), ...optional('filosofia'), ...optional('region'), ...optional('pais'),
      ...optional('denominacion_origen'), ...optional('anio_fundacion'), ...optional('web'),
      ...optional('video_url'), ...optional('razon_social'), ...optional('cif_vat'),
      ...optional('email_principal'), ...optional('telefono'), ...optional('persona_contacto'),
      ...optional('direccion_fisica'), ...optional('codigo_postal'), ...optional('ciudad'),
      ...optional('provincia'), ...optional('pais_contacto'),
      ...(record.fecha_alta === null ? {} : { fecha_alta: this.iso(record.fecha_alta) }),
      ...(record.fecha_aprobacion === null ? {} : { fecha_aprobacion: this.iso(record.fecha_aprobacion) }),
    };
  }

  private iso(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
