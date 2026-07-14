import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/bootstrap.js';

const PASSWORD = 'Password-segura-005!';
const EMAILS = [
  'api005-success@teralya.test',
  'api005-rollback@teralya.test',
  'api005-race@teralya.test',
];

function payload(email: string): Record<string, unknown> {
  return {
    nombre_comercial: 'Bodega API 005',
    razon_social: 'Bodega API 005, S.L.',
    cif_vat: 'ESB00500001',
    email,
    password: PASSWORD,
    persona_contacto: 'Responsable API',
    telefono: '+34910005005',
    aceptacion_condiciones: true,
    pais_contacto: 'España',
    ciudad: 'Madrid',
    codigo_postal: '28001',
  };
}

describe('API-005 — POST /bodegas', () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await cleanup(pool);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app as Parameters<typeof configureApplication>[0]);
    await app.init();
  });

  afterAll(async () => {
    await cleanup(pool);
    await app.close();
    await pool.end();
  });

  it('crea bodega, usuario y auditoría atómicamente sin emitir sesión', async () => {
    const response = await request(app.getHttpServer())
      .post('/bodegas')
      .send(payload(EMAILS[0] as string))
      .expect(201);

    expect(response.body).toMatchObject({
      nombre_comercial: 'Bodega API 005',
      razon_social: 'Bodega API 005, S.L.',
      cif_vat: 'ESB00500001',
      email_principal: EMAILS[0],
      estado: 'pendiente_revision',
      telefono: '+34910005005',
      persona_contacto: 'Responsable API',
      pais_contacto: 'España',
      ciudad: 'Madrid',
      codigo_postal: '28001',
    });
    expect(response.body).not.toHaveProperty('access_token');
    expect(response.body).not.toHaveProperty('tipo');

    const persisted = await pool.query<{
      estado: string;
      tipo: string;
      password_hash: string;
      rol: string;
      usuario_estado: string;
      auditorias: string;
    }>(
      `SELECT b.estado, b.tipo, u.password_hash, u.rol, u.estado AS usuario_estado,
              count(a.id)::text AS auditorias
         FROM bodega b
         JOIN usuario u ON u.bodega_id = b.id
         LEFT JOIN auditoria a
           ON a.entidad_id = b.id AND a.accion = 'registro_bodega'
        WHERE lower(u.email) = lower($1)
        GROUP BY b.id, u.id`,
      [EMAILS[0]],
    );
    expect(persisted.rows[0]).toMatchObject({
      estado: 'pendiente_revision',
      tipo: 'estandar',
      rol: 'bodega',
      usuario_estado: 'pendiente_verificacion',
      auditorias: '1',
    });
    expect(persisted.rows[0]?.password_hash).toMatch(/^scrypt\$/);
    expect(persisted.rows[0]?.password_hash).not.toContain(PASSWORD);
  });

  it('responde 400 y no persiste ante un request inválido', async () => {
    const invalid = payload('api005-invalid@teralya.test');
    invalid.aceptacion_condiciones = false;
    const response = await request(app.getHttpServer()).post('/bodegas').send(invalid).expect(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    const rows = await pool.query('SELECT id FROM usuario WHERE lower(email) = lower($1)', [
      'api005-invalid@teralya.test',
    ]);
    expect(rows.rowCount).toBe(0);
  });

  it('revierte la bodega cuando el usuario colisiona por email', async () => {
    await pool.query(
      `INSERT INTO usuario (email, password_hash, rol, estado)
       VALUES ($1, 'scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
               'administrador', 'activo')`,
      [EMAILS[1]],
    );

    const response = await request(app.getHttpServer())
      .post('/bodegas')
      .send(payload((EMAILS[1] as string).toUpperCase()))
      .expect(409);
    expect(response.body.code).toBe('CONFLICT');

    const bodegas = await pool.query(
      'SELECT id FROM bodega WHERE lower(email_principal) = lower($1)',
      [EMAILS[1]],
    );
    expect(bodegas.rowCount).toBe(0);
  });

  it('serializa la carrera case-insensitive: una creación y un conflicto', async () => {
    const [first, second] = await Promise.all([
      request(app.getHttpServer()).post('/bodegas').send(payload(EMAILS[2] as string)),
      request(app.getHttpServer())
        .post('/bodegas')
        .send(payload((EMAILS[2] as string).toUpperCase())),
    ]);
    expect([first.status, second.status].sort()).toEqual([201, 409]);

    const usuarios = await pool.query(
      'SELECT id FROM usuario WHERE lower(email) = lower($1)',
      [EMAILS[2]],
    );
    const bodegas = await pool.query(
      'SELECT id FROM bodega WHERE lower(email_principal) = lower($1)',
      [EMAILS[2]],
    );
    expect(usuarios.rowCount).toBe(1);
    expect(bodegas.rowCount).toBe(1);
  });
});

async function cleanup(pool: Pool): Promise<void> {
  await pool.query(
    `DELETE FROM auditoria
      WHERE entidad_id IN (
        SELECT id FROM bodega WHERE lower(email_principal) = ANY($1::text[])
      )`,
    [EMAILS],
  );
  await pool.query('DELETE FROM usuario WHERE lower(email) = ANY($1::text[])', [EMAILS]);
  await pool.query('DELETE FROM bodega WHERE lower(email_principal) = ANY($1::text[])', [EMAILS]);
}
