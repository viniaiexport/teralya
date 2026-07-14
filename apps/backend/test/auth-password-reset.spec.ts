import 'reflect-metadata';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { GenericAck } from '../src/modules/auth/dto/generic-ack.dto.js';
import { hashPassword, verifyPassword } from '../src/common/security/password.util.js';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3997';
process.env.DATABASE_URL ??= 'postgresql://teralya:teralya_local@localhost:5432/teralya';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.PUBLIC_BASE_URL ??= 'http://localhost:3001';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_test_placeholder_0000000000';
process.env.MINIMUM_PURCHASE_AGE ??= '18';
process.env.ALCOHOL_TERMS_VERSION ??= 'test-v1';
process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ??= '1000';
process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS ??= '60';
process.env.PASSWORD_RECOVERY_TOKEN_TTL_SECONDS ??= '3600';
process.env.PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS ??= '100';
process.env.PASSWORD_RECOVERY_RATE_LIMIT_WINDOW_SECONDS ??= '900';
process.env.PASSWORD_RECOVERY_URL ??= 'http://localhost:3000/restablecer-password';
process.env.PASSWORD_RECOVERY_FROM_EMAIL ??= 'no-reply@teralya.test';
process.env.SMTP_HOST ??= 'localhost';
process.env.SMTP_PORT ??= '1025';
process.env.SMTP_SECURE ??= 'false';
process.env.SMTP_USER ??= 'test';
process.env.SMTP_PASSWORD ??= 'test';

const PASSWORD_ORIGINAL = 'contraseña-original-123';
const PASSWORD_NUEVA = 'contraseña-nueva-456';

interface UsuarioFixture {
  id: string;
  email: string;
}

describe('API-004 — POST /auth/restablecer-password', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let redis: Redis;

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
    await pool.end();
    redis.disconnect();
    await app.close();
  });


  async function crearUsuarioActivo(): Promise<UsuarioFixture> {
    const email = `reset-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword(PASSWORD_ORIGINAL);
    const rows = await pool.query<{ id: string }>(
      `INSERT INTO usuario (email, password_hash, nombre, apellidos, idioma, rol, estado)
       VALUES ($1, $2, 'Test', 'Reset', 'es', 'comprador', 'activo')
       RETURNING id`,
      [email, passwordHash],
    );
    const id = rows.rows[0]?.id;
    if (id === undefined) {
      throw new Error('No se pudo crear el usuario de prueba.');
    }
    return { id, email };
  }

  function generarToken(): { token: string; tokenHash: string } {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return { token, tokenHash };
  }

  async function crearSolicitud(
    usuarioId: string,
    estado: 'pendiente' | 'utilizada' | 'expirada' | 'cancelada',
    opciones: { expirada?: boolean; usedAt?: boolean } = {},
  ): Promise<{ token: string; solicitudId: string }> {
    const { token, tokenHash } = generarToken();
    const rows = await pool.query<{ id: string }>(
      opciones.expirada === true
        ? `INSERT INTO solicitud_recuperacion_password
             (usuario_id, token_hash, estado, created_at, expires_at, used_at)
           VALUES ($1, $2, $3, now() - interval '2 hours', now() - interval '1 hour', ${opciones.usedAt === true ? 'now()' : 'NULL'})
           RETURNING id`
        : `INSERT INTO solicitud_recuperacion_password (usuario_id, token_hash, estado, expires_at, used_at)
           VALUES ($1, $2, $3, now() + interval '1 hour', ${opciones.usedAt === true ? 'now()' : 'NULL'})
           RETURNING id`,
      [usuarioId, tokenHash, estado],
    );
    const solicitudId = rows.rows[0]?.id;
    if (solicitudId === undefined) {
      throw new Error('No se pudo crear la solicitud de prueba.');
    }
    return { token, solicitudId };
  }

  function cuerpoValido(token: string, password = PASSWORD_NUEVA): Record<string, unknown> {
    return { token, password_nueva: password, confirmacion_password: password };
  }

  it('restablece la contraseña correctamente y el hash nuevo es verificable', async () => {
    const usuario = await crearUsuarioActivo();
    const { token } = await crearSolicitud(usuario.id, 'pendiente');

    const response = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(token))
      .expect(200);

    const body = response.body as GenericAck;
    expect(typeof body.message).toBe('string');
    expect(typeof body.request_id).toBe('string');

    const rows = await pool.query<{ password_hash: string }>('SELECT password_hash FROM usuario WHERE id = $1', [
      usuario.id,
    ]);
    const nuevoHash = rows.rows[0]?.password_hash ?? '';
    expect(await verifyPassword(PASSWORD_NUEVA, nuevoHash)).toBe(true);
    expect(await verifyPassword(PASSWORD_ORIGINAL, nuevoHash)).toBe(false);
  });

  it('rechaza contraseñas que no coinciden y campos no declarados (DTO cerrado)', async () => {
    const usuario = await crearUsuarioActivo();
    const { token } = await crearSolicitud(usuario.id, 'pendiente');

    const distintas = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send({ token, password_nueva: 'contraseña-aaaaaa', confirmacion_password: 'contraseña-bbbbbb' })
      .expect(400);
    expect(distintas.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });

    const { token: token2 } = await crearSolicitud(usuario.id, 'pendiente');
    const cerrado = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send({ ...cuerpoValido(token2), campo_extra: 'x' })
      .expect(400);
    expect(cerrado.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('rechaza un token inexistente con 404', async () => {
    const { token } = generarToken();

    const response = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(token))
      .expect(404);

    expect(response.body).toMatchObject({ status: 404, code: 'RESOURCE_NOT_FOUND' });
  });

  it('rechaza un token expirado, uno cancelado y uno ya utilizado con 409', async () => {
    const usuario = await crearUsuarioActivo();

    const { token: tokenExpirado } = await crearSolicitud(usuario.id, 'pendiente', { expirada: true });
    const expirado = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(tokenExpirado))
      .expect(409);
    expect(expirado.body).toMatchObject({ status: 409, code: 'CONFLICT' });

    const { token: tokenCancelado } = await crearSolicitud(usuario.id, 'cancelada');
    const cancelado = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(tokenCancelado))
      .expect(409);
    expect(cancelado.body).toMatchObject({ status: 409, code: 'CONFLICT' });

    const { token: tokenUtilizado } = await crearSolicitud(usuario.id, 'utilizada', { usedAt: true });
    const utilizado = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(tokenUtilizado))
      .expect(409);
    expect(utilizado.body).toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('garantiza uso único bajo dos consumos concurrentes del mismo token', async () => {
    const usuario = await crearUsuarioActivo();
    const { token } = await crearSolicitud(usuario.id, 'pendiente');

    const [primera, segunda] = await Promise.all([
      request(app.getHttpServer()).post('/auth/restablecer-password').send(cuerpoValido(token)),
      request(app.getHttpServer()).post('/auth/restablecer-password').send(cuerpoValido(token)),
    ]);

    const statuses = [primera.status, segunda.status].sort();
    expect(statuses).toEqual([200, 409]);
  });

  it('cancela las demás solicitudes pendientes del mismo usuario al consumir una', async () => {
    const usuario = await crearUsuarioActivo();
    const { token: tokenUsado, solicitudId: solicitudUsadaId } = await crearSolicitud(usuario.id, 'pendiente');
    const { solicitudId: solicitudHermanaId } = await crearSolicitud(usuario.id, 'pendiente');

    await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(tokenUsado))
      .expect(200);

    const estados = await pool.query<{ id: string; estado: string }>(
      'SELECT id, estado FROM solicitud_recuperacion_password WHERE id = ANY($1)',
      [[solicitudUsadaId, solicitudHermanaId]],
    );
    const porId = new Map(estados.rows.map((row) => [row.id, row.estado]));
    expect(porId.get(solicitudUsadaId)).toBe('utilizada');
    expect(porId.get(solicitudHermanaId)).toBe('cancelada');
  });

  it('revoca todas las sesiones del usuario sin afectar a otro usuario', async () => {
    const { SessionService } = await import('../src/common/security/session.service.js');
    const { RedisService } = await import('../src/common/cache/redis.service.js');
    const { ConfigService } = await import('@nestjs/config');

    const configService = new ConfigService({ REDIS_URL: process.env.REDIS_URL });
    const redisService = new RedisService(configService);
    const sessionService = new SessionService(redisService);

    const usuario = await crearUsuarioActivo();
    const otroUsuario = await crearUsuarioActivo();

    const sesionUsuario = await sessionService.issue({ usuarioId: usuario.id, rol: 'comprador' });
    const sesionOtroUsuario = await sessionService.issue({ usuarioId: otroUsuario.id, rol: 'comprador' });

    const hashUsuario = createHash('sha256').update(sesionUsuario.accessToken, 'utf8').digest('hex');
    const hashOtroUsuario = createHash('sha256').update(sesionOtroUsuario.accessToken, 'utf8').digest('hex');

    expect(await redis.get(`session:${hashUsuario}`)).not.toBeNull();
    expect(await redis.get(`session:${hashOtroUsuario}`)).not.toBeNull();

    const { token } = await crearSolicitud(usuario.id, 'pendiente');
    await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(token))
      .expect(200);

    expect(await redis.get(`session:${hashUsuario}`)).toBeNull();
    expect(await redis.get(`session:${hashOtroUsuario}`)).not.toBeNull();

    await redis.del(`session:${hashOtroUsuario}`);
    redisService.onModuleDestroy();
  });


  it('serializa login con contraseña antigua y reset sin dejar una sesión válida', async () => {
    const usuario = await crearUsuarioActivo();
    const { token } = await crearSolicitud(usuario.id, 'pendiente');

    const [login, reset] = await Promise.all([
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: usuario.email, password: PASSWORD_ORIGINAL }),
      request(app.getHttpServer())
        .post('/auth/restablecer-password')
        .send(cuerpoValido(token)),
    ]);

    expect(reset.status).toBe(200);
    expect([200, 401]).toContain(login.status);

    if (login.status === 200) {
      const accessToken = (login.body as { access_token: string }).access_token;
      const tokenHash = createHash('sha256').update(accessToken, 'utf8').digest('hex');
      expect(await redis.get(`session:${tokenHash}`)).toBeNull();
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: PASSWORD_ORIGINAL })
      .expect(401);
  });

  it('revierte PostgreSQL si Redis falla antes del commit', async () => {
    const { RedisService } = await import('../src/common/cache/redis.service.js');
    const redisService = app.get(RedisService);
    const usuario = await crearUsuarioActivo();
    const { token, solicitudId } = await crearSolicitud(usuario.id, 'pendiente');
    const failure = vi
      .spyOn(redisService.client, 'smembers')
      .mockRejectedValueOnce(new Error('fallo Redis simulado'));

    await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(token))
      .expect(500);

    failure.mockRestore();

    const usuarioRows = await pool.query<{ password_hash: string }>(
      'SELECT password_hash FROM usuario WHERE id = $1',
      [usuario.id],
    );
    expect(await verifyPassword(PASSWORD_ORIGINAL, usuarioRows.rows[0]?.password_hash ?? '')).toBe(true);

    const solicitudRows = await pool.query<{ estado: string }>(
      'SELECT estado FROM solicitud_recuperacion_password WHERE id = $1',
      [solicitudId],
    );
    expect(solicitudRows.rows[0]?.estado).toBe('pendiente');
  });


  it('nunca expone el token ni la contraseña en las respuestas de error', async () => {
    const usuario = await crearUsuarioActivo();
    const { token } = await crearSolicitud(usuario.id, 'cancelada');

    const response = await request(app.getHttpServer())
      .post('/auth/restablecer-password')
      .send(cuerpoValido(token))
      .expect(409);

    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain(token);
    expect(serialized).not.toContain(PASSWORD_NUEVA);
  });
});
