import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AdminBodegasRepository, BodegaAdminRecord } from '../src/modules/admin/admin-bodegas.repository.js';
import { AdminBodegasService } from '../src/modules/admin/admin-bodegas.service.js';

const BODEGA: BodegaAdminRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  nombre_comercial: 'Bodega Validada',
  slug: null,
  logo_url: null,
  imagen_principal_url: null,
  historia: null,
  filosofia: null,
  region: 'Rioja',
  pais: 'España',
  denominacion_origen: null,
  anio_fundacion: null,
  web: null,
  video_url: null,
  estado: 'aprobada',
  created_at: new Date('2026-07-01T10:00:00Z'),
  updated_at: new Date('2026-07-14T10:00:00Z'),
  razon_social: 'Bodega Validada, S.L.',
  cif_vat: 'ESB24000001',
  email_principal: 'info@validada.test',
  telefono: '+34910000000',
  persona_contacto: 'Ana',
  direccion_fisica: null,
  codigo_postal: null,
  ciudad: 'Logroño',
  provincia: null,
  pais_contacto: 'España',
  fecha_alta: new Date('2026-07-01T10:00:00Z'),
  fecha_aprobacion: new Date('2026-07-14T10:00:00Z'),
};

function setup() {
  const repository = { validar: vi.fn() };
  return {
    repository,
    service: new AdminBodegasService(repository as unknown as AdminBodegasRepository),
  };
}

describe('API-024 — validación administrativa de bodega', () => {
  it('devuelve exclusivamente BodegaAdmin, omite nulos y conserva fecha_alta', async () => {
    const { repository, service } = setup();
    repository.validar.mockResolvedValue({ kind: 'ok', bodega: BODEGA });

    const result = await service.validar(BODEGA.id, '22222222-2222-4222-8222-222222222222');

    expect(result).toEqual({
      id: BODEGA.id,
      nombre_comercial: 'Bodega Validada',
      region: 'Rioja',
      pais: 'España',
      estado: 'aprobada',
      created_at: '2026-07-01T10:00:00.000Z',
      updated_at: '2026-07-14T10:00:00.000Z',
      razon_social: 'Bodega Validada, S.L.',
      cif_vat: 'ESB24000001',
      email_principal: 'info@validada.test',
      telefono: '+34910000000',
      persona_contacto: 'Ana',
      ciudad: 'Logroño',
      pais_contacto: 'España',
      fecha_alta: '2026-07-01T10:00:00.000Z',
      fecha_aprobacion: '2026-07-14T10:00:00.000Z',
    });
    expect(result).not.toHaveProperty('comision');
    expect(result).not.toHaveProperty('aprobada_por');
    expect(result).not.toHaveProperty('updated_by');
  });

  it.each([
    ['not_found', NotFoundException, 'RESOURCE_NOT_FOUND'],
    ['invalid_state', ConflictException, 'CONFLICT'],
    ['incomplete', BadRequestException, 'VALIDATION_ERROR'],
  ] as const)('traduce %s al error contractual', async (kind, Exception, code) => {
    const { repository, service } = setup();
    repository.validar.mockResolvedValue({ kind });

    const operation = service.validar(BODEGA.id, '22222222-2222-4222-8222-222222222222');
    await expect(operation).rejects.toBeInstanceOf(Exception);
    await expect(operation).rejects.toMatchObject({ response: { code } });
  });

  it('delega siempre la identidad del administrador para trazabilidad', async () => {
    const { repository, service } = setup();
    repository.validar.mockResolvedValue({ kind: 'ok', bodega: BODEGA });
    await service.validar(BODEGA.id, '22222222-2222-4222-8222-222222222222');
    expect(repository.validar).toHaveBeenCalledWith(
      BODEGA.id,
      '22222222-2222-4222-8222-222222222222',
    );
  });
});
