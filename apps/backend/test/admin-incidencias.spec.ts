import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type {
  AdminIncidenciasRepository,
  IncidentRecord,
} from '../src/modules/admin/admin-incidencias.repository.js';
import { AdminIncidenciasService } from '../src/modules/admin/admin-incidencias.service.js';

const ID = '11111111-1111-4111-8111-111111111111';
const RESOURCE_ID = '22222222-2222-4222-8222-222222222222';
const INCIDENT: IncidentRecord = {
  id: ID,
  tipo: 'retraso_logistico',
  estado: 'abierta',
  fecha: '2026-07-14T10:00:00Z',
  descripcion: 'El envío no ha salido a tiempo.',
  updated_at: '2026-07-14T11:00:00Z',
  recurso_tipo: 'pedido',
  recurso_id: RESOURCE_ID,
};

function setup() {
  const repository = { listar: vi.fn(), obtener: vi.fn(), transition: vi.fn() };
  return {
    repository,
    service: new AdminIncidenciasService(
      repository as unknown as AdminIncidenciasRepository,
    ),
  };
}

describe('APIs 040/041/042 — incidencias administrativas', () => {
  it('pagina, proyecta el recurso relacionado y serializa fechas', async () => {
    const { repository, service } = setup();
    repository.listar.mockResolvedValue({ items: [INCIDENT], total: 21 });
    await expect(service.listar('abierta', 2, 20)).resolves.toEqual({
      items: [
        {
          id: ID,
          tipo: 'retraso_logistico',
          estado: 'abierta',
          fecha: '2026-07-14T10:00:00.000Z',
          recurso_relacionado: { tipo: 'pedido', id: RESOURCE_ID },
        },
      ],
      page: 2,
      page_size: 20,
      total_items: 21,
      total_pages: 2,
    });
  });

  it.each(['pedido', 'subpedido', 'bodega', 'vino'] as const)(
    'proyecta detalle relacionado con %s',
    async (tipo) => {
      const { repository, service } = setup();
      repository.obtener.mockResolvedValue({ ...INCIDENT, recurso_tipo: tipo });
      await expect(service.obtener(ID)).resolves.toMatchObject({
        descripcion: INCIDENT.descripcion,
        recurso_relacionado: { tipo, id: RESOURCE_ID },
        updated_at: '2026-07-14T11:00:00.000Z',
      });
    },
  );

  it('devuelve el detalle tras una transición válida o idempotente', async () => {
    const { repository, service } = setup();
    repository.transition.mockResolvedValue({
      kind: 'updated',
      incident: { ...INCIDENT, estado: 'en_revision' },
    });
    await expect(service.actualizar(ID, 'en_revision')).resolves.toMatchObject({
      estado: 'en_revision',
    });
  });

  it('traduce inexistencia, uuid inválido y transición prohibida', async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue(null);
    repository.transition.mockResolvedValueOnce({ kind: 'missing' }).mockResolvedValueOnce({
      kind: 'conflict',
    });
    await expect(service.obtener(ID)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.obtener('no-es-uuid')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.actualizar(ID, 'en_revision')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.actualizar(ID, 'cerrada')).rejects.toBeInstanceOf(ConflictException);
  });
});
