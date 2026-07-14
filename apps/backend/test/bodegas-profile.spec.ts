import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { EmailBodegaYaRegistradoError } from '../src/modules/bodegas/bodegas.repository.js';
import type { BodegaPerfil, BodegasRepository } from '../src/modules/bodegas/bodegas.repository.js';
import { BodegasService } from '../src/modules/bodegas/bodegas.service.js';

const PERFIL: BodegaPerfil = {
  id: '11111111-1111-4111-8111-111111111111',
  nombre_comercial: 'Bodega Segura',
  slug: 'bodega-segura',
  logo_url: null,
  imagen_principal_url: null,
  historia: 'Historia',
  filosofia: null,
  region: 'Rioja',
  pais: 'España',
  denominacion_origen: 'DOCa Rioja',
  anio_fundacion: 1980,
  web: 'https://bodega.example',
  video_url: null,
  estado: 'activa',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: '2026-02-01T00:00:00Z',
  razon_social: 'Bodega Segura, S.L.',
  cif_vat: 'ESB12345678',
  email_principal: 'info@bodega.example',
  telefono: '+34910000000',
  persona_contacto: 'Ana',
  direccion_fisica: null,
  codigo_postal: null,
  ciudad: 'Logroño',
  provincia: null,
  pais_contacto: 'España',
};

function setup() {
  const repository = {
    obtenerPerfil: vi.fn(),
    actualizarPerfil: vi.fn(),
  };
  const service = new BodegasService(repository as unknown as BodegasRepository);
  return { repository, service };
}

describe('API-006/API-031 — perfil propio de bodega', () => {
  it('proyecta exactamente BodegaSelf y omite campos nulos', async () => {
    const { repository, service } = setup();
    repository.obtenerPerfil.mockResolvedValue(PERFIL);

    const result = await service.obtenerPerfilPropio(PERFIL.id);

    expect(repository.obtenerPerfil).toHaveBeenCalledWith(PERFIL.id);
    expect(result).toEqual({
      id: PERFIL.id,
      nombre_comercial: 'Bodega Segura',
      slug: 'bodega-segura',
      historia: 'Historia',
      region: 'Rioja',
      pais: 'España',
      denominacion_origen: 'DOCa Rioja',
      anio_fundacion: 1980,
      web: 'https://bodega.example',
      estado: 'activa',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
      razon_social: 'Bodega Segura, S.L.',
      cif_vat: 'ESB12345678',
      email_principal: 'info@bodega.example',
      telefono: '+34910000000',
      persona_contacto: 'Ana',
      ciudad: 'Logroño',
      pais_contacto: 'España',
    });
  });

  it('distingue bodega inexistente de bodega no operativa al consultar', async () => {
    const { repository, service } = setup();
    repository.obtenerPerfil.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...PERFIL, estado: 'suspendida' });
    await expect(service.obtenerPerfilPropio(PERFIL.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.obtenerPerfilPropio(PERFIL.id)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza PATCH vacío y no llama al repositorio', async () => {
    const { repository, service } = setup();
    await expect(service.actualizarPerfilPropio(PERFIL.id, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.obtenerPerfil).not.toHaveBeenCalled();
  });

  it('actualiza exclusivamente la bodega derivada del actor', async () => {
    const { repository, service } = setup();
    repository.obtenerPerfil.mockResolvedValue(PERFIL);
    repository.actualizarPerfil.mockResolvedValue({ ...PERFIL, nombre_comercial: 'Nombre nuevo' });

    const result = await service.actualizarPerfilPropio(PERFIL.id, { nombre_comercial: 'Nombre nuevo' });

    expect(repository.actualizarPerfil).toHaveBeenCalledWith(PERFIL.id, { nombre_comercial: 'Nombre nuevo' });
    expect(result.nombre_comercial).toBe('Nombre nuevo');
  });

  it('traduce colisiones únicas a 409', async () => {
    const { repository, service } = setup();
    repository.obtenerPerfil.mockResolvedValue(PERFIL);
    repository.actualizarPerfil.mockRejectedValue(new EmailBodegaYaRegistradoError());
    await expect(
      service.actualizarPerfilPropio(PERFIL.id, { email_principal: 'ocupado@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
