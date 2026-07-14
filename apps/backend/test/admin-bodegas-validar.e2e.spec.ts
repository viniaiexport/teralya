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

const HASH = 'scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('La fixture no devolvió la fila esperada.');
  return value;
}

describe('API-024 — POST /admin/bodegas/:id/validar', () => {
  let app: INestApplication;
  let pool: Pool;
  let adminId: string;
  let token: string;
  const bodegaIds: string[] = [];
  const usuarioIds: string[] = [];

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app as Parameters<typeof configureApplication>[0]);
    await app.init();
    const admin = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email, password_hash, rol, estado)
       VALUES ($1, $2, 'administrador', 'activo') RETURNING id`,
      [`api024-admin-${randomUUID()}@teralya.test`, HASH],
    );
    adminId = required(admin.rows[0]).id;
    token = (await app.get(SessionService).issue({ usuarioId: adminId, rol: 'administrador' })).accessToken;
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM auditoria WHERE entidad_id = ANY($1::uuid[])`, [bodegaIds]);
    await pool.query(`DELETE FROM usuario WHERE id = ANY($1::uuid[]) OR id = $2`, [usuarioIds, adminId]);
    await pool.query(`DELETE FROM bodega WHERE id = ANY($1::uuid[])`, [bodegaIds]);
    await pool.end();
    await app.close();
  });

  async function createPending(complete = true): Promise<{ bodegaId: string; usuarioId: string; createdAt: Date }> {
    const bodega = await pool.query<{ id: string; created_at: Date }>(
      `INSERT INTO bodega (
         nombre_comercial, razon_social, cif_vat, estado, tipo, email_principal,
         telefono, persona_contacto
       ) VALUES ($1, $2, $3, 'pendiente_revision', 'estandar', $4, $5, $6)
       RETURNING id, created_at`,
      [
        'Bodega API 024',
        complete ? 'Bodega API 024, S.L.' : null,
        'ESB02400001',
        `api024-bodega-${randomUUID()}@teralya.test`,
        '+34910024024',
        'Responsable API 024',
      ],
    );
    const bodegaRow = required(bodega.rows[0]);
    const bodegaId = bodegaRow.id;
    const user = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email, password_hash, rol, estado, bodega_id)
       VALUES ($1, $2, 'bodega', 'pendiente_verificacion', $3) RETURNING id`,
      [`api024-user-${randomUUID()}@teralya.test`, HASH, bodegaId],
    );
    bodegaIds.push(bodegaId);
    const usuarioId = required(user.rows[0]).id;
    usuarioIds.push(usuarioId);
    return { bodegaId, usuarioId, createdAt: bodegaRow.created_at };
  }

  it('aprueba atómicamente, fija comisión/actores/fechas, activa usuarios y no filtra internos', async () => {
    const fixture = await createPending();
    const response = await request(app.getHttpServer() as Server)
      .post(`/admin/bodegas/${fixture.bodegaId}/validar`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({ id: fixture.bodegaId, estado: 'aprobada' });
    expect(response.body).not.toHaveProperty('comision');
    expect(response.body).not.toHaveProperty('aprobada_por');
    expect(response.body).not.toHaveProperty('updated_by');
    const persisted = await pool.query<{
      estado: string; comision: string; fecha_alta: Date; created_at: Date;
      fecha_aprobacion: Date; aprobada_por: string; updated_by: string;
      usuario_estado: string; auditorias: string;
    }>(
      `SELECT b.estado, b.comision::text, b.fecha_alta, b.created_at, b.fecha_aprobacion,
              b.aprobada_por, b.updated_by, u.estado AS usuario_estado,
              count(a.id)::text AS auditorias
         FROM bodega b JOIN usuario u ON u.bodega_id = b.id
         LEFT JOIN auditoria a ON a.entidad_id = b.id AND a.accion = 'validar_bodega'
        WHERE b.id = $1 GROUP BY b.id, u.id`,
      [fixture.bodegaId],
    );
    expect(persisted.rows[0]).toMatchObject({
      estado: 'aprobada', comision: '10.00', aprobada_por: adminId,
      updated_by: adminId, usuario_estado: 'activo', auditorias: '1',
    });
    const persistedRow = required(persisted.rows[0]);
    expect(persistedRow.fecha_alta.toISOString()).toBe(persistedRow.created_at.toISOString());
    expect(persistedRow.fecha_aprobacion).toBeInstanceOf(Date);
  });

  it('serializa dos validaciones concurrentes: exactamente un 200 y un 409', async () => {
    const { bodegaId } = await createPending();
    const call = () => request(app.getHttpServer() as Server)
      .post(`/admin/bodegas/${bodegaId}/validar`).set('Authorization', `Bearer ${token}`);
    const responses = await Promise.all([call(), call()]);
    expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
    const conflictBody = responses.find(({ status }) => status === 409)?.body as Record<string, unknown> | undefined;
    expect(conflictBody?.code).toBe('CONFLICT');
    const audits = await pool.query(
      `SELECT id FROM auditoria WHERE entidad_id = $1 AND accion = 'validar_bodega'`, [bodegaId],
    );
    expect(audits.rowCount).toBe(1);
  });

  it('devuelve 400 sin mutar una solicitud con datos mínimos incompletos', async () => {
    const { bodegaId, usuarioId } = await createPending(false);
    const response = await request(app.getHttpServer() as Server)
      .post(`/admin/bodegas/${bodegaId}/validar`).set('Authorization', `Bearer ${token}`).expect(400);
    expect((response.body as Record<string, unknown>).code).toBe('VALIDATION_ERROR');
    const rows = await pool.query<{ estado: string; comision: string | null; usuario_estado: string }>(
      `SELECT b.estado, b.comision::text, u.estado AS usuario_estado
         FROM bodega b JOIN usuario u ON u.id = $2 WHERE b.id = $1`, [bodegaId, usuarioId],
    );
    expect(rows.rows[0]).toEqual({ estado: 'pendiente_revision', comision: null, usuario_estado: 'pendiente_verificacion' });
  });

  it('revierte toda la transacción si falla la referencia al administrador', async () => {
    const { bodegaId, usuarioId } = await createPending();
    const disposableAdmin = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email, password_hash, rol, estado)
       VALUES ($1, $2, 'administrador', 'activo') RETURNING id`,
      [`api024-removed-${randomUUID()}@teralya.test`, HASH],
    );
    const disposableToken = (await app.get(SessionService).issue({
      usuarioId: required(disposableAdmin.rows[0]).id, rol: 'administrador',
    })).accessToken;
    await pool.query('DELETE FROM usuario WHERE id = $1', [required(disposableAdmin.rows[0]).id]);

    await request(app.getHttpServer() as Server)
      .post(`/admin/bodegas/${bodegaId}/validar`)
      .set('Authorization', `Bearer ${disposableToken}`).expect(500);
    const rows = await pool.query<{ estado: string; comision: string | null; usuario_estado: string; audits: string }>(
      `SELECT b.estado, b.comision::text, u.estado AS usuario_estado, count(a.id)::text AS audits
         FROM bodega b JOIN usuario u ON u.id = $2 LEFT JOIN auditoria a ON a.entidad_id = b.id
        WHERE b.id = $1 GROUP BY b.id, u.id`, [bodegaId, usuarioId],
    );
    expect(rows.rows[0]).toEqual({
      estado: 'pendiente_revision', comision: null,
      usuario_estado: 'pendiente_verificacion', audits: '0',
    });
  });
});
