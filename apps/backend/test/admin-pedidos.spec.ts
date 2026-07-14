import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type {
  AdminOrderRecord,
  AdminPedidosRepository,
} from '../src/modules/admin/admin-pedidos.repository.js';
import { AdminPedidosService } from '../src/modules/admin/admin-pedidos.service.js';

const ID = '11111111-1111-4111-8111-111111111111';
const BUYER = '22222222-2222-4222-8222-222222222222';
const SUBORDER = '33333333-3333-4333-8333-333333333333';
const WINE = '44444444-4444-4444-8444-444444444444';
const ADDRESS = {
  nombre_destinatario: 'Comprador',
  direccion: 'Calle 1',
  codigo_postal: '28001',
  ciudad: 'Madrid',
  pais: 'ES',
};
const ORDER: AdminOrderRecord = {
  id: ID,
  numero_pedido: 'TER-2026-001',
  comprador_id: BUYER,
  estado: 'pagado',
  subtotal: '20.00',
  gastos_envio: '2.00',
  impuestos: '0.00',
  descuentos: '1.00',
  total: '21.00',
  moneda: 'EUR',
  created_at: '2026-07-14T10:00:00Z',
  direccion_envio_snapshot: ADDRESS,
  direccion_facturacion_snapshot: ADDRESS,
  lineas: [
    {
      id: '55555555-5555-4555-8555-555555555555',
      vino_id: WINE,
      nombre_vino: 'Reserva',
      bodega: 'Bodega Norte',
      precio_unitario: '20.00',
      cantidad: 1,
      importe_total: '20.00',
    },
  ],
  subpedidos: [
    {
      id: SUBORDER,
      pedido_id: ID,
      estado: 'pendiente',
      subtotal: '20.00',
      gastos_envio: '2.00',
      impuestos: '0.00',
      total: '22.00',
      fecha_ultimo_cambio_estado: '2026-07-14T11:00:00Z',
      transportista: null,
      numero_seguimiento: null,
      fecha_preparacion: null,
      fecha_envio: null,
      fecha_entrega_prevista: null,
      fecha_entrega_real: null,
      lineas: [],
    },
  ],
};

function setup() {
  const repository = { listar: vi.fn(), obtener: vi.fn() };
  return {
    repository,
    service: new AdminPedidosService(repository as unknown as AdminPedidosRepository),
  };
}

describe('APIs 027/039 — pedidos administrativos', () => {
  it('lista todos los pedidos con paginación estable', async () => {
    const { repository, service } = setup();
    repository.listar.mockResolvedValue({ items: [ORDER], total: 41 });
    await expect(service.listar(3, 20)).resolves.toEqual({
      items: [
        {
          id: ID,
          numero_pedido: 'TER-2026-001',
          estado: 'pagado',
          total: '21.00',
          moneda: 'EUR',
          created_at: '2026-07-14T10:00:00.000Z',
        },
      ],
      page: 3,
      page_size: 20,
      total_items: 41,
      total_pages: 3,
    });
  });

  it('proyecta detalle congelado, líneas y subpedidos completos', async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue(ORDER);
    await expect(service.obtener(ID)).resolves.toEqual({
      id: ID,
      numero_pedido: 'TER-2026-001',
      comprador_id: BUYER,
      estado: 'pagado',
      total: '21.00',
      moneda: 'EUR',
      created_at: '2026-07-14T10:00:00.000Z',
      totales: {
        subtotal: '20.00',
        gastos_envio: '2.00',
        impuestos: '0.00',
        descuentos: '1.00',
        total: '21.00',
        moneda: 'EUR',
      },
      direccion_envio_snapshot: ADDRESS,
      direccion_facturacion_snapshot: ADDRESS,
      lineas: ORDER.lineas,
      subpedidos: [
        {
          id: SUBORDER,
          pedido_id: ID,
          estado: 'pendiente',
          total: '22.00',
          moneda: 'EUR',
          fecha_ultimo_cambio_estado: '2026-07-14T11:00:00.000Z',
          totales: {
            subtotal: '20.00',
            gastos_envio: '2.00',
            impuestos: '0.00',
            total: '22.00',
            moneda: 'EUR',
          },
          lineas: [],
          direccion_envio_snapshot: ADDRESS,
          tracking: {},
          pedido_estado: 'pagado',
        },
      ],
    });
  });

  it('omite añada nula y serializa tracking presente', async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue({
      ...ORDER,
      lineas: [{ ...ORDER.lineas[0], anada: null }],
      subpedidos: [
        {
          ...ORDER.subpedidos[0],
          transportista: 'Correos',
          fecha_envio: '2026-07-14T12:00:00Z',
        },
      ],
    });
    const result = await service.obtener(ID);
    expect(result.lineas[0]).not.toHaveProperty('anada');
    expect(result.subpedidos[0]?.tracking).toEqual({
      transportista: 'Correos',
      fecha_envio: '2026-07-14T12:00:00.000Z',
    });
  });

  it('trata UUID inválido e inexistente como 404', async () => {
    const { repository, service } = setup();
    repository.obtener.mockResolvedValue(null);
    await expect(service.obtener('invalido')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.obtener(ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
