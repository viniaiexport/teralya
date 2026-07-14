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

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Fixture ausente.');
  return value;
}

describe('APIs 040/041/042 — incidencias administrativas E2E', () => {
  let app: INestApplication;
  let pool: Pool;
  let adminToken: string;
  let buyerToken: string;
  let bodegaId: string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app as Parameters<typeof configureApplication>[0]);
    await app.init();
    const admin = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email,password_hash,rol,estado) VALUES ($1,$2,'administrador','activo') RETURNING id`,
      [`admin-incidents-${randomUUID()}@teralya.test`, HASH],
    );
    const buyer = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email,password_hash,rol,estado) VALUES ($1,$2,'comprador','activo') RETURNING id`,
      [`buyer-incidents-${randomUUID()}@teralya.test`, HASH],
    );
    const bodega = await pool.query<{ id: string }>(
      `INSERT INTO bodega (nombre_comercial,estado,comision) VALUES ($1,'aprobada',10.00) RETURNING id`,
      [`Incident Bodega ${randomUUID()}`],
    );
    bodegaId = required(bodega.rows[0]).id;
    const sessions = app.get(SessionService);
    adminToken = (
      await sessions.issue({ usuarioId: required(admin.rows[0]).id, rol: 'administrador' })
    ).accessToken;
    buyerToken = (
      await sessions.issue({ usuarioId: required(buyer.rows[0]).id, rol: 'comprador' })
    ).accessToken;
  });

  afterAll(async () => {
    await pool.end();
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${adminToken}` });

  async function incident(estado: 'abierta' | 'en_revision' | 'resuelta' | 'cerrada' = 'abierta') {
    const row = await pool.query<{ id: string }>(
      `INSERT INTO incidencia (tipo,estado,descripcion,bodega_id) VALUES ('retraso_logistico',$1,'Retraso de preparación',$2) RETURNING id`,
      [estado, bodegaId],
    );
    return required(row.rows[0]).id;
  }

  it('protege las tres rutas por sesión y rol administrador', async () => {
    const id = await incident();
    await request(app.getHttpServer() as Server).get('/admin/incidencias').expect(401);
    await request(app.getHttpServer() as Server)
      .get(`/admin/incidencias/${id}`)
      .set({ Authorization: `Bearer ${buyerToken}` })
      .expect(403);
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set({ Authorization: `Bearer ${buyerToken}` })
      .send({ estado_destino: 'en_revision' })
      .expect(403);
  });

  it('lista con filtro y paginación y consulta el detalle', async () => {
    const id = await incident('abierta');
    const list = await request(app.getHttpServer() as Server)
      .get('/admin/incidencias?estado=abierta&page=1&page_size=100')
      .set(auth())
      .expect(200);
    expect(list.body).toMatchObject({ page: 1, page_size: 100 });
    expect((list.body as { items: { id: string }[] }).items.some((item) => item.id === id)).toBe(true);
    const detail = await request(app.getHttpServer() as Server)
      .get(`/admin/incidencias/${id}`)
      .set(auth())
      .expect(200);
    expect(detail.body).toMatchObject({
      id,
      estado: 'abierta',
      descripcion: 'Retraso de preparación',
      recurso_relacionado: { tipo: 'bodega', id: bodegaId },
    });
    await request(app.getHttpServer() as Server)
      .get('/admin/incidencias?estado=invalida')
      .set(auth())
      .expect(400);
  });

  it('distingue recurso inexistente y payload inválido', async () => {
    await request(app.getHttpServer() as Server)
      .get('/admin/incidencias/no-es-uuid')
      .set(auth())
      .expect(404);
    await request(app.getHttpServer() as Server)
      .get(`/admin/incidencias/${randomUUID()}`)
      .set(auth())
      .expect(404);
    const id = await incident();
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'desconocida' })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'en_revision', extra: true })
      .expect(400);
  });

  it('aplica la matriz, audita una vez y conserva idempotencia concurrente', async () => {
    const id = await incident();
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'resuelta' })
      .expect(409);
    const update = () =>
      request(app.getHttpServer() as Server)
        .patch(`/admin/incidencias/${id}`)
        .set(auth())
        .send({ estado_destino: 'en_revision' });
    const responses = await Promise.all([update(), update()]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'abierta' })
      .expect(409);
    const persisted = await pool.query<{ estado: string; audits: string }>(
      `SELECT i.estado,count(a.id)::text AS audits FROM incidencia i LEFT JOIN auditoria a ON a.entidad_id=i.id AND a.tipo_entidad='incidencia' AND a.accion='cambio_estado' WHERE i.id=$1 GROUP BY i.id`,
      [id],
    );
    expect(persisted.rows[0]).toEqual({ estado: 'en_revision', audits: '1' });
  });

  it('permite únicamente la cadena completa y deja cerrada como terminal', async () => {
    const id = await incident();
    for (const estado_destino of ['en_revision', 'resuelta', 'cerrada']) {
      const response = await request(app.getHttpServer() as Server)
        .patch(`/admin/incidencias/${id}`)
        .set(auth())
        .send({ estado_destino })
        .expect(200);
      expect(response.body).toMatchObject({ estado: estado_destino });
    }
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'en_revision' })
      .expect(409);
    await request(app.getHttpServer() as Server)
      .patch(`/admin/incidencias/${id}`)
      .set(auth())
      .send({ estado_destino: 'cerrada' })
      .expect(200);
    const audit = await pool.query<{ total: string }>(
      `SELECT count(*)::text AS total FROM auditoria WHERE entidad_id=$1 AND tipo_entidad='incidencia' AND accion='cambio_estado'`,
      [id],
    );
    expect(audit.rows[0]?.total).toBe('3');
  });
});
