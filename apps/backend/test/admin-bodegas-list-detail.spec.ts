import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { DatabaseService } from '../src/common/database/database.service.js';
import {
  AdminBodegasRepository,
  type BodegaAdminRecord,
} from '../src/modules/admin/admin-bodegas.repository.js';
import { AdminBodegasService } from '../src/modules/admin/admin-bodegas.service.js';
import { AdminBodegasQueryDto } from '../src/modules/admin/dto/admin-bodegas-query.dto.js';

const RECORD: BodegaAdminRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  nombre_comercial: 'Bodega Pendiente',
  slug: null,
  logo_url: null,
  imagen_principal_url: null,
  historia: null,
  filosofia: null,
  region: null,
  pais: null,
  denominacion_origen: null,
  anio_fundacion: null,
  web: null,
  video_url: null,
  estado: 'pendiente_revision',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: '2026-01-02T00:00:00Z',
  razon_social: 'Pendiente, S.L.',
  cif_vat: 'ESB12345678',
  email_principal: 'info@pendiente.example',
  telefono: null,
  persona_contacto: null,
  direccion_fisica: null,
  codigo_postal: null,
  ciudad: null,
  provincia: null,
  pais_contacto: 'España',
  fecha_alta: null,
  fecha_aprobacion: null,
};

describe('API-035/API-036 — administración de bodegas', () => {
  it('acepta el alias pendiente y aplica los defaults de paginación', async () => {
    const dto = plainToInstance(AdminBodegasQueryDto, { estado: 'pendiente' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ estado: 'pendiente', page: 1, page_size: 20 });

    const invalid = plainToInstance(AdminBodegasQueryDto, { estado: 'pendiente_revision', page: 0, page_size: 101 });
    expect(await validate(invalid)).toHaveLength(3);
  });

  it('calcula metadatos exactos y proyecta únicamente BodegaAdminSummary', async () => {
    const repository = {
      listarPendientes: vi.fn().mockResolvedValue({ items: [RECORD], totalItems: 21 }),
    };
    const service = new AdminBodegasService(repository as unknown as AdminBodegasRepository);
    await expect(service.listarPendientes(2, 20)).resolves.toEqual({
      items: [{
        id: RECORD.id,
        nombre_comercial: RECORD.nombre_comercial,
        estado: 'pendiente_revision',
        created_at: '2026-01-01T00:00:00.000Z',
        razon_social: 'Pendiente, S.L.',
        cif_vat: 'ESB12345678',
        pais_contacto: 'España',
      }],
      page: 2,
      page_size: 20,
      total_items: 21,
      total_pages: 2,
    });
  });

  it('filtra pendiente_revision, pagina y ordena establemente en una sola instantánea SQL', async () => {
    const query = vi.fn().mockResolvedValue([{ ...RECORD, total_items: '1' }]);
    const repository = new AdminBodegasRepository({ query } as unknown as DatabaseService);
    await expect(repository.listarPendientes(3, 10)).resolves.toMatchObject({ totalItems: 1, items: [RECORD] });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE estado = 'pendiente_revision'"),
      [10, 20],
    );
    expect(query.mock.calls[0]?.[0]).toContain('ORDER BY created_at ASC, id ASC');
  });

  it('devuelve la página vacía conservando el total', async () => {
    const query = vi.fn().mockResolvedValue([{ total_items: '22' }]);
    const repository = new AdminBodegasRepository({ query } as unknown as DatabaseService);
    await expect(repository.listarPendientes(99, 20)).resolves.toEqual({ items: [], totalItems: 22 });
  });

  it('API-036 omite null y normaliza fechas', async () => {
    const repository = { obtenerDetalle: vi.fn().mockResolvedValue(RECORD) };
    const service = new AdminBodegasService(repository as unknown as AdminBodegasRepository);
    const result = await service.obtenerDetalle(RECORD.id);
    expect(result).toEqual({
      id: RECORD.id,
      nombre_comercial: RECORD.nombre_comercial,
      estado: RECORD.estado,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      razon_social: 'Pendiente, S.L.',
      cif_vat: 'ESB12345678',
      email_principal: 'info@pendiente.example',
      pais_contacto: 'España',
    });
  });

  it('trata tanto UUID inválido como bodega inexistente como 404', async () => {
    const repository = { obtenerDetalle: vi.fn().mockResolvedValue(null) };
    const service = new AdminBodegasService(repository as unknown as AdminBodegasRepository);
    await expect(service.obtenerDetalle('no-es-uuid')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.obtenerDetalle).not.toHaveBeenCalled();
    await expect(service.obtenerDetalle(RECORD.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
