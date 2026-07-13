import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { GenericAck } from '../src/modules/auth/dto/generic-ack.dto.js';

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

interface UsuarioFixture {
  id: string;
  email: string;
}

interface SolicitudRow {
  id: string;
  token_hash: string;
  estado: string;
  created_at: Date;
  expires_at: Date;
}

describe('API-003 — POST /auth/recuperar-password', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let redis: Redis;

  beforeAll(async () => {
    const { NestFactory } = await import('@nestjs/core');
    const { AppModule } = await import('../src/app.module.js');
    const { configureApplication } = await import('../src/bootstrap.js');

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      rawBody: true,
      logger: false,
    });
    configureApplication(app);
    await app.init();

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    redis = new Redis(process.env.REDIS_URL as string);
  });

  afterAll(async () => {
    for (const key of await redis.keys('password-recovery-rate:*')) {
      await redis.del(key);
    }
    await pool.end();
    redis.disconnect();
    await app.close();
  });

  async function crearUsuario(): Promise<UsuarioFixture> {
    const email = `recovery-${randomUUID()}@example.com`;
    const result = await pool.query<{ id: string }>(
      `INSERT INTO usuario (
         email, password_hash, nombre, apellidos, idioma, rol, estado, email_verificado
       ) VALUES ($1, 'scrypt$test-only', 'Ada', 'Lovelace', 'es', 'administrador', 'activo', true)
       RETURNING id`,
      [email],
    );
    const id = result.rows[0]?.id;
    if (id === undefined) {
      throw new Error('No se pudo crear el usuario de prueba.');
    }
    return { id, email };
  }

  it('crea una solicitud segura, envía y registra trazabilidad sin secretos', async () => {
    const usuario = await crearUsuario();
    const requestId = randomUUID();

    const response = await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .set('X-Request-Id', requestId)
      .send({ email: `  ${usuario.email.toUpperCase()}  ` })
      .expect(200);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['x-request-id']).toBe(requestId);
    expect(response.body as GenericAck).toEqual({
      message:
        'Si existe una cuenta asociada, recibirás instrucciones para restablecer la contraseña.',
      request_id: requestId,
    });

    const solicitudes = await pool.query<SolicitudRow>(
      `SELECT id, token_hash, estado, created_at, expires_at
         FROM solicitud_recuperacion_password
        WHERE usuario_id = $1
        ORDER BY created_at DESC`,
      [usuario.id],
    );
    expect(solicitudes.rows).toHaveLength(1);
    const solicitud = solicitudes.rows[0];
    expect(solicitud?.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(solicitud?.estado).toBe('pendiente');
    expect(solicitud?.expires_at.getTime()).toBeGreaterThan(solicitud?.created_at.getTime() ?? 0);

    const notifications = await pool.query<{
      estado: string;
      contenido: string | null;
      plantilla: string;
    }>(
      `SELECT estado, contenido, plantilla
         FROM notificacion
        WHERE usuario_id = $1 AND tipo_notificacion = 'recuperacion_password'`,
      [usuario.id],
    );
    expect(notifications.rows).toEqual([
      { estado: 'enviada', contenido: null, plantilla: 'password_recovery' },
    ]);

    const audit = await pool.query<{ descripcion: string; valor_nuevo: unknown }>(
      `SELECT descripcion, valor_nuevo
         FROM auditoria
        WHERE usuario_id = $1 AND accion = 'solicitud_recuperacion'
        ORDER BY fecha_hora DESC LIMIT 1`,
      [usuario.id],
    );
    const persistedSecurityData = JSON.stringify({
      solicitud,
      notifications: notifications.rows,
      audit: audit.rows,
    });
    expect(persistedSecurityData).not.toContain('token=');
    expect(persistedSecurityData).not.toContain(process.env.PASSWORD_RECOVERY_URL);
  });

  it('devuelve una respuesta exactamente igual exista o no la cuenta', async () => {
    const usuario = await crearUsuario();
    const requestId = randomUUID();

    const existing = await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .set('X-Request-Id', requestId)
      .send({ email: usuario.email })
      .expect(200);
    const missing = await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .set('X-Request-Id', requestId)
      .send({ email: `missing-${randomUUID()}@example.com` })
      .expect(200);

    expect(existing.body as GenericAck).toEqual(missing.body as GenericAck);
    expect(existing.headers['content-type']).toBe(missing.headers['content-type']);
    expect(existing.headers['x-request-id']).toBe(missing.headers['x-request-id']);
  });

  it('cancela la solicitud pendiente anterior al emitir una nueva', async () => {
    const usuario = await crearUsuario();

    await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .send({ email: usuario.email })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .send({ email: usuario.email })
      .expect(200);

    const solicitudes = await pool.query<{ estado: string }>(
      `SELECT estado
         FROM solicitud_recuperacion_password
        WHERE usuario_id = $1
        ORDER BY created_at ASC`,
      [usuario.id],
    );
    expect(solicitudes.rows.map((row) => row.estado)).toEqual(['cancelada', 'pendiente']);
  });

  it('rechaza campos desconocidos, null y emails inválidos con 400', async () => {
    for (const body of [
      { email: 'no-es-email' },
      { email: null },
      { email: 'usuario@example.com', campo_no_declarado: true },
    ]) {
      const response = await request(app.getHttpServer())
        .post('/auth/recuperar-password')
        .send(body)
        .expect(400);
      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    }
  });

  it('aplica rate limit antiabuso sin reiniciarlo tras respuestas 200', async () => {
    const email = `rate-recovery-${randomUUID()}@example.com`;
    const maxAttempts = Number(process.env.PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/recuperar-password')
        .send({ email })
        .expect(200);
    }

    const response = await request(app.getHttpServer())
      .post('/auth/recuperar-password')
      .send({ email })
      .expect(429);

    expect(response.body).toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
      retryable: true,
    });
  });
});
