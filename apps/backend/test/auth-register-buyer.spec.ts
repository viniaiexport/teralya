import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AuthSession } from '../src/modules/auth/dto/auth-session.dto.js';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3999';
process.env.DATABASE_URL ??= 'postgresql://teralya:teralya_local@localhost:5432/teralya';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.PUBLIC_BASE_URL ??= 'http://localhost:3001';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_test_placeholder_0000000000';
process.env.MINIMUM_PURCHASE_AGE ??= '18';
process.env.ALCOHOL_TERMS_VERSION ??= 'test-v1';
process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ??= '5';
process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS ??= '60';
process.env.PASSWORD_RECOVERY_TOKEN_TTL_SECONDS ??= '3600';
process.env.PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS ??= '3';
process.env.PASSWORD_RECOVERY_RATE_LIMIT_WINDOW_SECONDS ??= '900';
process.env.PASSWORD_RECOVERY_URL ??= 'http://localhost:3000/restablecer-password';
process.env.PASSWORD_RECOVERY_FROM_EMAIL ??= 'no-reply@teralya.test';
process.env.SMTP_HOST ??= 'localhost';
process.env.SMTP_PORT ??= '1025';
process.env.SMTP_SECURE ??= 'false';
process.env.SMTP_USER ??= 'test';
process.env.SMTP_PASSWORD ??= 'test';

function cuerpoValido(email: string): Record<string, unknown> {
  return {
    email,
    password: 'contraseña-larga-123',
    nombre: 'Ada',
    apellidos: 'Lovelace',
    fecha_nacimiento: '1990-01-01',
    declaracion_mayoria_edad: true,
    aceptacion_condiciones_alcohol: true,
  };
}

describe('API-001 — POST /auth/registro/comprador', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let redis: Redis;
  const emailsCreados: string[] = [];

  beforeAll(async () => {
    const { NestFactory } = await import('@nestjs/core');
    const { AppModule } = await import('../src/app.module.js');
    const { configureApplication } = await import('../src/bootstrap.js');

    app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true, logger: false });
    configureApplication(app);
    await app.init();

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    redis = new Redis(process.env.REDIS_URL as string);
  });

  afterAll(async () => {
    if (emailsCreados.length > 0) {
      const usuarios = await pool.query<{ id: string }>('SELECT id FROM usuario WHERE email = ANY($1)', [emailsCreados]);
      const usuarioIds = new Set(usuarios.rows.map((row) => row.id));
      for (const key of await redis.keys('session:*')) {
        const raw = await redis.get(key);
        if (raw === null) {
          continue;
        }
        const session = JSON.parse(raw) as { usuario_id?: string };
        if (session.usuario_id !== undefined && usuarioIds.has(session.usuario_id)) {
          await redis.del(key);
        }
      }

      await pool.query('DELETE FROM comprador WHERE usuario_id IN (SELECT id FROM usuario WHERE email = ANY($1))', [
        emailsCreados,
      ]);
      await pool.query('DELETE FROM usuario WHERE email = ANY($1)', [emailsCreados]);
    }
    await pool.end();
    redis.disconnect();
    await app.close();
  });

  it('registra un comprador nuevo y devuelve 201 con AuthSession', async () => {
    const email = `comprador-${randomUUID()}@example.com`;
    emailsCreados.push(email);

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send(cuerpoValido(email))
      .expect(201);

    expect(response.headers['content-type']).toContain('application/json');
    const body = response.body as AuthSession;
    expect(body).toMatchObject({
      token_type: 'Bearer',
      expires_in: 28_800,
      usuario: {
        email,
        rol: 'comprador',
        idioma: 'es',
        estado: 'activo',
      },
    });
    expect(body.access_token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(typeof body.usuario.id).toBe('string');
    expect(new Date(body.expires_at).getTime()).toBeGreaterThan(Date.now());

    const usuarioRows = await pool.query<{ password_hash: string }>(
      'SELECT password_hash FROM usuario WHERE email = $1',
      [email],
    );
    expect(usuarioRows.rows).toHaveLength(1);
    const storedHash = usuarioRows.rows[0]?.password_hash ?? '';
    expect(storedHash).not.toContain('contraseña-larga-123');
    expect(storedHash.startsWith('scrypt$')).toBe(true);

    const compradorRows = await pool.query<{
      declaracion_mayoria_edad: boolean;
      aceptacion_condiciones_alcohol: boolean;
      declaracion_mayoria_edad_at: Date;
      aceptacion_condiciones_alcohol_at: Date;
      version_condiciones_alcohol: string;
    }>(
      `SELECT declaracion_mayoria_edad, aceptacion_condiciones_alcohol,
              declaracion_mayoria_edad_at, aceptacion_condiciones_alcohol_at,
              version_condiciones_alcohol
         FROM comprador c
         JOIN usuario u ON u.id = c.usuario_id
        WHERE u.email = $1`,
      [email],
    );
    expect(compradorRows.rows).toHaveLength(1);
    expect(compradorRows.rows[0]).toMatchObject({
      declaracion_mayoria_edad: true,
      aceptacion_condiciones_alcohol: true,
      version_condiciones_alcohol: process.env.ALCOHOL_TERMS_VERSION,
    });
    expect(compradorRows.rows[0]?.declaracion_mayoria_edad_at).toBeInstanceOf(Date);
    expect(compradorRows.rows[0]?.aceptacion_condiciones_alcohol_at).toBeInstanceOf(Date);

    const sessionKeys = await redis.keys('session:*');
    let sessionEncontrada = false;
    for (const key of sessionKeys) {
      const raw = await redis.get(key);
      if (raw !== null && raw.includes(body.usuario.id) && !raw.includes(body.access_token)) {
        sessionEncontrada = true;
        const storedSession = JSON.parse(raw) as { issued_at?: string; expires_at?: string };
        expect(storedSession.issued_at).toBeTruthy();
        expect(storedSession.expires_at).toBeTruthy();
        const ttl = await redis.ttl(key);
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(28_800);
      }
    }
    expect(sessionEncontrada).toBe(true);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'contraseña-larga-123' })
      .expect(200);
    expect(login.body).toMatchObject({
      usuario: { email, rol: 'comprador', estado: 'activo' },
    });
  });

  it('rechaza un email ya registrado con 409 Conflict', async () => {
    const email = `comprador-${randomUUID()}@example.com`;
    emailsCreados.push(email);

    await request(app.getHttpServer()).post('/auth/registro/comprador').send(cuerpoValido(email)).expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send(cuerpoValido(email))
      .expect(409);

    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({ status: 409, code: 'CONFLICT' });

    const usuarioRows = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    expect(usuarioRows.rows).toHaveLength(1);
  });

  it('rechaza una petición con validación cerrada (campo desconocido)', async () => {
    const email = `comprador-${randomUUID()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send({ ...cuerpoValido(email), campo_no_declarado: 'x' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });

    const usuarioRows = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    expect(usuarioRows.rows).toHaveLength(0);
  });

  it('rechaza declaracion_mayoria_edad u aceptacion_condiciones_alcohol distintos de true', async () => {
    const email = `comprador-${randomUUID()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send({ ...cuerpoValido(email), declaracion_mayoria_edad: false })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rechaza una fecha de nacimiento que no cumple la edad mínima configurada', async () => {
    const email = `comprador-${randomUUID()}@example.com`;
    const today = new Date();
    const underageDate = new Date(
      Date.UTC(today.getUTCFullYear() - 17, today.getUTCMonth(), today.getUTCDate()),
    )
      .toISOString()
      .slice(0, 10);

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send({ ...cuerpoValido(email), fecha_nacimiento: underageDate })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    const usuarioRows = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    expect(usuarioRows.rows).toHaveLength(0);
  });

  it('normaliza email, nombre, apellidos e idioma antes de persistir', async () => {
    const email = `comprador-${randomUUID()}@example.com`;
    emailsCreados.push(email);

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send({
        ...cuerpoValido(`  ${email.toUpperCase()}  `),
        nombre: '  Ada  ',
        apellidos: '  Lovelace  ',
        idioma: '  ES  ',
      })
      .expect(201);

    expect(response.body).toMatchObject({ usuario: { email, idioma: 'es' } });
    const usuarioRows = await pool.query<{ nombre: string; apellidos: string }>(
      'SELECT nombre, apellidos FROM usuario WHERE email = $1',
      [email],
    );
    expect(usuarioRows.rows).toEqual([{ nombre: 'Ada', apellidos: 'Lovelace' }]);
  });

  it('rechaza fecha_nacimiento con hora porque el contrato exige format date', async () => {
    const email = `comprador-${randomUUID()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/registro/comprador')
      .send({ ...cuerpoValido(email), fecha_nacimiento: '1990-01-01T00:00:00Z' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });
});

describe('DatabaseService — transacción atómica', () => {
  it('revierte por completo si una operación posterior falla dentro de la misma transacción', async () => {
    process.env.DATABASE_URL ??= 'postgresql://teralya:teralya_local@localhost:5432/teralya';
    const { DatabaseService } = await import('../src/common/database/database.service.js');
    const { ConfigService } = await import('@nestjs/config');

    const configService = new ConfigService({ DATABASE_URL: process.env.DATABASE_URL });
    const databaseService = new DatabaseService(configService);
    const email = `rollback-${randomUUID()}@example.com`;

    await expect(
      databaseService.withTransaction(async (client) => {
        await client.query(
          `INSERT INTO usuario (email, password_hash, nombre, apellidos, idioma, rol, estado)
           VALUES ($1, 'scrypt$1$1$1$aa$bb', 'Test', 'Rollback', 'es', 'comprador', DEFAULT)`,
          [email],
        );
        // Fuerza un fallo tras el primer INSERT para comprobar el ROLLBACK.
        await client.query('SELECT columna_inexistente FROM usuario LIMIT 1');
      }),
    ).rejects.toThrow();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const rows = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    expect(rows.rows).toHaveLength(0);
    await pool.end();
    await databaseService.close();
  });
});
