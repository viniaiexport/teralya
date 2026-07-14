import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/bootstrap.js';
import { SessionService } from '../src/common/security/session.service.js';

const HASH =
  'scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const ADDRESS = {
  nombre_destinatario: 'Comprador Admin',
  direccion: 'Calle Mayor 1',
  codigo_postal: '28001',
  ciudad: 'Madrid',
  pais: 'ES',
};

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Fixture ausente.');
  return value;
}

describe('APIs 027/039 — pedidos administrativos E2E', () => {
  let app: INestApplication;
  let pool: Pool;
  let adminToken: string;
  let buyerToken: string;
  let orderId: string;
  let buyerId: string;
  let suborderId: string;
  let wineId: string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app as Parameters<typeof configureApplication>[0]);
    await app.init();
    const admin = await pool.query<{ id: string }>(
      `INSERT INTO usuario(email,password_hash,rol,estado) VALUES($1,$2,'administrador','activo') RETURNING id`,
      [`admin-orders-${randomUUID()}@teralya.test`, HASH],
    );
    const buyer = await pool.query<{ id: string }>(
      `INSERT INTO usuario(email,password_hash,rol,estado) VALUES($1,$2,'comprador','activo') RETURNING id`,
      [`buyer-orders-${randomUUID()}@teralya.test`, HASH],
    );
    buyerId = required(buyer.rows[0]).id;
    await pool.query(
      `INSERT INTO comprador(usuario_id,fecha_nacimiento,declaracion_mayoria_edad,aceptacion_condiciones_alcohol) VALUES($1,'1980-01-01',true,true)`,
      [buyerId],
    );
    const addressId = required((await pool.query<{id:string}>(`INSERT INTO direccion(propietario_tipo,propietario_id,nombre_identificativo,destinatario,direccion,codigo_postal,ciudad,pais,es_envio,es_facturacion,activa) VALUES('comprador',$1,'Admin','Comprador Admin','Calle Mayor 1','28001','Madrid','ES',true,true,true) RETURNING id`,[buyerId])).rows[0]).id;
    const cartId = required((await pool.query<{id:string}>(`INSERT INTO carrito(comprador_id,estado) VALUES($1,'convertido') RETURNING id`,[buyerId])).rows[0]).id;
    const bodega = required(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO bodega(nombre_comercial,estado,comision) VALUES($1,'aprobada',10) RETURNING id`,
          [`Admin Orders Bodega ${randomUUID()}`],
        )
      ).rows[0],
    ).id;
    orderId = required(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO pedido(numero_pedido,comprador_id,carrito_id,subtotal,gastos_envio,impuestos,descuentos,total,direccion_envio_id,direccion_envio_snapshot,direccion_facturacion_id,direccion_facturacion_snapshot,estado) VALUES($1,$2,$3,20,2,0,1,21,$4,$5::jsonb,$4,$5::jsonb,'pagado') RETURNING id`,
          [`TER-${randomUUID()}`, buyerId, cartId, addressId, JSON.stringify(ADDRESS)],
        )
      ).rows[0],
    ).id;
    const pago = required(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO pago(pedido_id,subtotal,gastos_envio,impuestos,comision_marketplace,total_cobrado,total_repartido,total_reembolsado,moneda,estado) VALUES($1,20,2,0,2,21,19,0,'EUR','pagado') RETURNING id`,
          [orderId],
        )
      ).rows[0],
    ).id;
    suborderId = required(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO subpedido(pedido_id,bodega_id,pago_id,subtotal,gastos_envio,impuestos,comision_marketplace,total,estado,transportista,numero_seguimiento) VALUES($1,$2,$3,20,2,0,2,22,'pendiente','Correos','TRACK-1') RETURNING id`,
          [orderId, bodega, pago],
        )
      ).rows[0],
    ).id;
    wineId = required(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO vino(bodega_id,nombre_comercial,precio,moneda,stock_disponible,disponible_venta,estado) VALUES($1,'Reserva',20,'EUR',10,true,'publicado') RETURNING id`,
          [bodega],
        )
      ).rows[0],
    ).id;
    await pool.query(
      `INSERT INTO pedido_item(pedido_id,subpedido_id,vino_id,bodega_id,nombre_vino_snapshot,bodega_snapshot,precio_unitario,cantidad,importe_total) VALUES($1,$2,$3,$4,'Reserva','Admin Orders Bodega',20,1,20)`,
      [orderId, suborderId, wineId, bodega],
    );
    const sessions = app.get(SessionService);
    adminToken = (
      await sessions.issue({ usuarioId: required(admin.rows[0]).id, rol: 'administrador' })
    ).accessToken;
    buyerToken = (
      await sessions.issue({ usuarioId: buyerId, rol: 'comprador' })
    ).accessToken;
  });

  afterAll(async () => {
    await pool.end();
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${adminToken}` });

  it('protege listado y detalle por sesión y rol administrador', async () => {
    await request(app.getHttpServer() as Server).get('/admin/pedidos').expect(401);
    await request(app.getHttpServer() as Server)
      .get(`/admin/pedidos/${orderId}`)
      .set({ Authorization: `Bearer ${buyerToken}` })
      .expect(403);
  });

  it('lista todos los pedidos con paginación y rechaza query inválida', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/admin/pedidos?page=1&page_size=100')
      .set(auth())
      .expect(200);
    expect(response.body).toMatchObject({ page: 1, page_size: 100 });
    expect(
      (response.body as { items: { id: string }[] }).items.some((item) => item.id === orderId),
    ).toBe(true);
    await request(app.getHttpServer() as Server)
      .get('/admin/pedidos?page=0')
      .set(auth())
      .expect(400);
  });

  it('devuelve detalle administrativo con línea y subpedido congelados', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get(`/admin/pedidos/${orderId}`)
      .set(auth())
      .expect(200);
    expect(response.body).toMatchObject({
      id: orderId,
      comprador_id: buyerId,
      estado: 'pagado',
      total: '21.00',
      direccion_envio_snapshot: { ciudad: 'Madrid' },
      lineas: [{ vino_id: wineId, nombre_vino: 'Reserva', importe_total: '20.00' }],
      subpedidos: [
        {
          id: suborderId,
          pedido_estado: 'pagado',
          total: '22.00',
          tracking: { transportista: 'Correos', numero_seguimiento: 'TRACK-1' },
          lineas: [{ vino_id: wineId }],
        },
      ],
    });
  });

  it('trata UUID inválido e inexistente como 404', async () => {
    await request(app.getHttpServer() as Server)
      .get('/admin/pedidos/no-es-uuid')
      .set(auth())
      .expect(404);
    await request(app.getHttpServer() as Server)
      .get(`/admin/pedidos/${randomUUID()}`)
      .set(auth())
      .expect(404);
  });
});
