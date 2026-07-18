import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BodegasRepository, type BodegaPublicaRecord } from '../src/modules/bodegas/bodegas.repository.js';
import { BodegasService } from '../src/modules/bodegas/bodegas.service.js';
import type { DatabaseService } from '../src/common/database/database.service.js';

const PUBLICA: BodegaPublicaRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  nombre_comercial: 'Bodega Pública',
  slug: 'bodega-publica',
  logo_url: null,
  imagen_principal_url: 'https://cdn.example/bodega.jpg',
  historia: 'Historia pública',
  filosofia: null,
  region: 'Rioja',
  pais: 'España',
  denominacion_origen: 'DOCa Rioja',
  anio_fundacion: 1980,
  web: null,
  video_url: null,
  paises_envio: ['ES', 'FR'],
  plazo_preparacion_dias: 2,
  plazo_entrega_estimado: 'De 2 a 5 días laborables.',
  coste_envio_descripcion: 'Calculado antes del pago.',
  transportista_habitual: 'Transportista de prueba',
  restricciones_entrega: null,
  condiciones_empaquetado: 'Caja protectora.',
  capacidad_internacional: true,
  vinos: [{
    id: '22222222-2222-4222-8222-222222222222',
    nombre_comercial: 'Reserva',
    precio: '19.90',
    moneda: 'EUR',
    disponible_venta: true,
    slug: null,
    tipo_vino: 'tinto',
    anada: 2020,
    region: null,
    denominacion_origen: 'DOCa Rioja',
  }],
};

describe('API-030 — perfil público de bodega', () => {
  it('proyecta únicamente BodegaPublic y WineSummary, omitiendo nulos y datos privados', async () => {
    const repository = { obtenerPublica: vi.fn().mockResolvedValue(PUBLICA) };
    const service = new BodegasService(repository as unknown as BodegasRepository);

    const result = await service.obtenerPublica(PUBLICA.id);

    expect(result).toEqual({
      id: PUBLICA.id,
      nombre_comercial: 'Bodega Pública',
      slug: 'bodega-publica',
      imagen_principal_url: 'https://cdn.example/bodega.jpg',
      historia: 'Historia pública',
      region: 'Rioja',
      pais: 'España',
      denominacion_origen: 'DOCa Rioja',
      anio_fundacion: 1980,
      paises_envio: ['ES', 'FR'],
      plazo_preparacion_dias: 2,
      plazo_entrega_estimado: 'De 2 a 5 días laborables.',
      coste_envio_descripcion: 'Calculado antes del pago.',
      transportista_habitual: 'Transportista de prueba',
      condiciones_empaquetado: 'Caja protectora.',
      capacidad_internacional: true,
      vinos: [{
        id: '22222222-2222-4222-8222-222222222222',
        nombre_comercial: 'Reserva',
        precio: '19.90',
        moneda: 'EUR',
        disponible_venta: true,
        tipo_vino: 'tinto',
        anada: 2020,
        denominacion_origen: 'DOCa Rioja',
        bodega: {
          id: PUBLICA.id,
          nombre_comercial: 'Bodega Pública',
          slug: 'bodega-publica',
          region: 'Rioja',
          pais: 'España',
          denominacion_origen: 'DOCa Rioja',
        },
      }],
    });
    expect(result).not.toHaveProperty('estado');
    expect(result).not.toHaveProperty('razon_social');
    expect(result).not.toHaveProperty('cif_vat');
    expect(result).not.toHaveProperty('email_principal');
    expect(result).not.toHaveProperty('persona_contacto');
  });

  it('responde 404 sin distinguir inexistente de no pública', async () => {
    const repository = { obtenerPublica: vi.fn().mockResolvedValue(null) };
    const service = new BodegasService(repository as unknown as BodegasRepository);
    await expect(service.obtenerPublica(PUBLICA.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('trata un identificador inválido como no encontrado sin consultar PostgreSQL', async () => {
    const repository = { obtenerPublica: vi.fn() };
    const service = new BodegasService(repository as unknown as BodegasRepository);
    await expect(service.obtenerPublica('no-es-un-uuid')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.obtenerPublica).not.toHaveBeenCalled();
  });

  it('filtra la bodega operativa y solo consulta vinos publicados', async () => {
    const database = { query: vi.fn()
      .mockResolvedValueOnce([{ ...PUBLICA, vinos: undefined }])
      .mockResolvedValueOnce(PUBLICA.vinos) };
    const repository = new BodegasRepository(database as unknown as DatabaseService);

    const result = await repository.obtenerPublica(PUBLICA.id);

    expect(result?.vinos).toEqual(PUBLICA.vinos);
    const bodegaSql = String(database.query.mock.calls[0]?.[0]);
    const vinosSql = String(database.query.mock.calls[1]?.[0]);
    expect(bodegaSql).toContain("estado IN ('aprobada', 'activa')");
    expect(bodegaSql).not.toMatch(/razon_social|cif_vat|email_principal|telefono|persona_contacto/);
    expect(vinosSql).toContain("estado = 'publicado'");
    expect(database.query).toHaveBeenNthCalledWith(1, expect.any(String), [PUBLICA.id]);
    expect(database.query).toHaveBeenNthCalledWith(2, expect.any(String), [PUBLICA.id]);
  });

  it('no consulta vinos si la bodega no es pública', async () => {
    const database = { query: vi.fn().mockResolvedValue([]) };
    const repository = new BodegasRepository(database as unknown as DatabaseService);
    await expect(repository.obtenerPublica(PUBLICA.id)).resolves.toBeNull();
    expect(database.query).toHaveBeenCalledTimes(1);
  });
});
