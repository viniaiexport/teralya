import 'reflect-metadata';
import { createHash, randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashPassword } from '../src/common/security/password.util.js';
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

type Rol = 'comprador' | 'bodega' | 'administrador';
type EstadoUsuario = 'pendiente_verificacion' | 'activo' | 'suspendido' | 'bloqueado' | 'eliminado';
type EstadoBodega = 'borrador' | 'pendiente_revision' | 'aprobada' | 'activa' | 'suspendida' | 'archivada';

interface CrearUsuarioOptions {
  rol?: Rol;
  estado?: EstadoUsuario;
  cuentaBloqueada?: boolean;
  bodegaEstado?: EstadoBodega;
  password?: string;
  intentosFallidos?: number;
}

interface UsuarioFixture {
  id: string;
  email: string;
  password: string;
  bodegaId?: string;
}

interface ProblemBody {
  status: number;
  code: string;
  detail: string;
  retryable: boolean;
}

describe('API-002 — POST /auth/login', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let redis: Redis;
  const usuarioIds = new Set<string>();

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
    for (const key of await redis.keys('login-rate:*')) {
      await redis.del(key);
    }
    await pool.end();
    redis.disconnect();
    await app.close();
  });

  async function crearUsuario(options: CrearUsuarioOptions = {}): Promise<UsuarioFixture> {
    const rol = options.rol ?? 'comprador';
    const estado = options.estado ?? 'activo';
    const password = options.password ?? 'contraseña-login-123';
    const email = `login-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword(password);
    let bodegaId: string | undefined;

    if (rol === 'bodega') {
      const bodega = await pool.query<{ id: string }>(
        `INSERT INTO bodega (nombre_comercial, estado, comision)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          `Bodega ${randomUUID()}`,
          options.bodegaEstado ?? 'activa',
          ['aprobada', 'activa'].includes(options.bodegaEstado ?? 'activa') ? 12 : null,
        ],
      );
      bodegaId = bodega.rows[0]?.id;
    }

    const result = await pool.query<{ id: string }>(
      `INSERT INTO usuario (
         email, password_hash, nombre, apellidos, idioma, rol, bodega_id,
         estado, email_verificado, cuenta_bloqueada, intentos_fallidos
       ) VALUES ($1, $2, 'Ada', 'Lovelace', 'es', $3, $4, $5, true, $6, $7)
       RETURNING id`,
      [
        email,
        passwordHash,
        rol,
        bodegaId ?? null,
        estado,
        options.cuentaBloqueada ?? false,
        options.intentosFallidos ?? 0,
      ],
    );
    const id = result.rows[0]?.id;
    if (id === undefined) {
      throw new Error('No se pudo crear el usuario de prueba.');
    }
    usuarioIds.add(id);

    if (rol === 'comprador') {
      await pool.query(
        `INSERT INTO comprador (
           usuario_id, fecha_nacimiento, declaracion_mayoria_edad,
           declaracion_mayoria_edad_at, aceptacion_condiciones_alcohol,
           aceptacion_condiciones_alcohol_at, version_condiciones_alcohol
         ) VALUES ($1, '1990-01-01', true, now(), true, now(), 'test-v1')`,
        [id],
      );
    }

    return { id, email, password, ...(bodegaId === undefined ? {} : { bodegaId }) };
  }

  it('autentica un comprador activo, persiste acceso/auditoría y emite sesión opaca', async () => {
    const usuario = await crearUsuario({ intentosFallidos: 2 });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `  ${usuario.email.toUpperCase()}  `, password: usuario.password })
      .expect(200);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['x-request-id']).toBeTruthy();
    const body = response.body as AuthSession;
    expect(body).toMatchObject({
      token_type: 'Bearer',
      expires_in: 28_800,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: 'comprador',
        idioma: 'es',
        estado: 'activo',
        nombre: 'Ada',
        apellidos: 'Lovelace',
      },
    });
    expect(body.access_token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(body.usuario).not.toHaveProperty('bodega_id');

    const stored = await pool.query<{ fecha_ultimo_acceso: Date; intentos_fallidos: number }>(
      'SELECT fecha_ultimo_acceso, intentos_fallidos FROM usuario WHERE id = $1',
      [usuario.id],
    );
    expect(stored.rows[0]?.fecha_ultimo_acceso).toBeInstanceOf(Date);
    expect(stored.rows[0]?.intentos_fallidos).toBe(0);

    const audit = await pool.query<{ resultado: string; descripcion: string }>(
      `SELECT resultado, descripcion FROM auditoria
        WHERE usuario_id = $1 AND accion = 'inicio_sesion'
        ORDER BY fecha_hora DESC LIMIT 1`,
      [usuario.id],
    );
    expect(audit.rows[0]).toEqual({ resultado: 'correcto', descripcion: 'Inicio de sesión correcto.' });
    expect(JSON.stringify(audit.rows[0])).not.toContain(usuario.password);
    expect(JSON.stringify(audit.rows[0])).not.toContain(body.access_token);

    const tokenHash = createHash('sha256').update(body.access_token).digest('hex');
    const rawSession = await redis.get(`session:${tokenHash}`);
    expect(rawSession).not.toBeNull();
    expect(rawSession).not.toContain(body.access_token);
    expect(JSON.parse(rawSession as string)).toMatchObject({
      usuario_id: usuario.id,
      rol: 'comprador',
    });
    expect(JSON.parse(rawSession as string)).toHaveProperty('issued_at');
    expect(JSON.parse(rawSession as string)).toHaveProperty('expires_at');
    expect(await redis.ttl(`session:${tokenHash}`)).toBeGreaterThan(0);

    const rateKey = `login-rate:${createHash('sha256').update(usuario.email).digest('hex')}`;
    expect(await redis.exists(rateKey)).toBe(0);
  });

  it.each([
    ['administrador', undefined],
    ['bodega', 'aprobada'],
    ['bodega', 'activa'],
  ] as const)('autentica el rol %s con estado operativo %s', async (rol, bodegaEstado) => {
    const usuario = await crearUsuario({
      rol,
      ...(bodegaEstado === undefined ? {} : { bodegaEstado }),
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: usuario.password })
      .expect(200);

    expect(response.body).toMatchObject({
      usuario: {
        id: usuario.id,
        rol,
        ...(usuario.bodegaId === undefined ? {} : { bodega_id: usuario.bodegaId }),
      },
    });
  });

  it('hace indistinguibles email inexistente y contraseña incorrecta', async () => {
    const usuario = await crearUsuario();
    const inexistente = `inexistente-${randomUUID()}@example.com`;

    const wrongPassword = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: 'contraseña-incorrecta-123' })
      .expect(401);
    const wrongEmail = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: inexistente, password: 'contraseña-incorrecta-123' })
      .expect(401);

    for (const response of [wrongPassword, wrongEmail]) {
      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.headers['www-authenticate']).toBe('Bearer');
      const body = response.body as ProblemBody;
      expect(body).toMatchObject({
        status: 401,
        code: 'AUTHENTICATION_REQUIRED',
        detail: 'Las credenciales proporcionadas no son válidas.',
        retryable: false,
      });
    }
    const wrongPasswordBody = wrongPassword.body as ProblemBody;
    const wrongEmailBody = wrongEmail.body as ProblemBody;
    expect(wrongPasswordBody.code).toBe(wrongEmailBody.code);
    expect(wrongPasswordBody.detail).toBe(wrongEmailBody.detail);

    const stored = await pool.query<{ intentos_fallidos: number }>(
      'SELECT intentos_fallidos FROM usuario WHERE id = $1',
      [usuario.id],
    );
    expect(stored.rows[0]?.intentos_fallidos).toBe(1);
  });

  it.each([
    [{ estado: 'pendiente_verificacion' as const }, 'cuenta pendiente'],
    [{ estado: 'suspendido' as const }, 'cuenta suspendida'],
    [{ estado: 'bloqueado' as const }, 'cuenta bloqueada'],
    [{ estado: 'eliminado' as const }, 'cuenta eliminada'],
    [{ cuentaBloqueada: true }, 'bloqueo de seguridad'],
  ])('rechaza con 403 una %s', async (options) => {
    const usuario = await crearUsuario(options);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: usuario.password })
      .expect(403);

    expect(response.body).toMatchObject({ status: 403, code: 'FORBIDDEN', retryable: false });
  });

  it.each(['borrador', 'pendiente_revision', 'suspendida', 'archivada'] as const)(
    'rechaza con 403 una bodega en estado %s',
    async (bodegaEstado) => {
      const usuario = await crearUsuario({ rol: 'bodega', bodegaEstado });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: usuario.email, password: usuario.password })
        .expect(403);

      expect(response.body).toMatchObject({ status: 403, code: 'FORBIDDEN' });
    },
  );

  it('mantiene la contraseña literal sin aplicar trim', async () => {
    const password = '  contraseña-con-espacios  ';
    const usuario = await crearUsuario({ password });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: password.trim() })
      .expect(401);
  });

  it('aplica DTO cerrado y validación contractual', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'usuario@example.com',
        password: 'contraseña-login-123',
        campo_no_declarado: true,
      })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('responde 429 cuando se supera el límite configurable', async () => {
    const email = `rate-${randomUUID()}@example.com`;
    const maxAttempts = Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'contraseña-incorrecta-123' })
        .expect(401);
    }

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'contraseña-incorrecta-123' })
      .expect(429);

    expect(response.body).toMatchObject({ status: 429, code: 'RATE_LIMITED', retryable: true });
  });
});
