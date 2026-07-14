import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
  AUTH_BODEGA_ASSOCIATION_METADATA,
  AUTH_ROLES_METADATA,
} from '../src/common/security/auth.decorators.js';
import { BearerAuthGuard } from '../src/common/security/bearer-auth.guard.js';
import type { SessionActor, SessionService } from '../src/common/security/session.service.js';

const TOKEN = 'A'.repeat(43);

function contextFor(authorization?: string): { context: ExecutionContext; request: { headers: Record<string, string> }; response: { setHeader: ReturnType<typeof vi.fn> } } {
  const request = { headers: authorization === undefined ? {} : { authorization } };
  const response = { setHeader: vi.fn() };
  const handler = () => undefined;
  class Controller {}
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
      getHandler: () => handler,
      getClass: () => Controller,
    } as unknown as ExecutionContext,
    response,
  };
}

function reflectorWith(values: { roles?: SessionActor['rol'][]; bodega?: boolean }): Reflector {
  return {
    getAllAndOverride: vi.fn((key: string) =>
      key === AUTH_ROLES_METADATA ? values.roles : key === AUTH_BODEGA_ASSOCIATION_METADATA ? values.bodega : undefined,
    ),
  } as unknown as Reflector;
}

describe('BearerAuthGuard', () => {
  it.each([
    undefined,
    '',
    `bearer ${TOKEN}`,
    `Bearer  ${TOKEN}`,
    `Bearer ${TOKEN}=`,
    `Bearer ${TOKEN} extra`,
  ])('rechaza Authorization ausente o no canónico: %s', async (authorization) => {
    const resolve = vi.fn();
    const guard = new BearerAuthGuard({ resolve } as unknown as SessionService, reflectorWith({}));
    const { context, response } = contextFor(authorization);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(resolve).not.toHaveBeenCalled();
    expect(response.setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'Bearer');
  });

  it('rechaza sesiones inexistentes, expiradas o revocadas resueltas como nulas', async () => {
    const resolve = vi.fn().mockResolvedValue(null);
    const guard = new BearerAuthGuard({ resolve } as unknown as SessionService, reflectorWith({}));

    await expect(guard.canActivate(contextFor(`Bearer ${TOKEN}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(resolve).toHaveBeenCalledWith(TOKEN);
  });

  it('adjunta el usuario tipado cuando la sesión y el rol son válidos', async () => {
    const user: SessionActor = {
      usuarioId: 'usuario-1',
      rol: 'bodega',
      bodegaId: 'bodega-1',
      issuedAt: new Date('2026-01-01T00:00:00Z'),
      expiresAt: new Date('2027-01-01T00:00:00Z'),
    };
    const guard = new BearerAuthGuard(
      { resolve: vi.fn().mockResolvedValue(user) } as unknown as SessionService,
      reflectorWith({ roles: ['bodega'], bodega: true }),
    );
    const { context, request } = contextFor(`Bearer ${TOKEN}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toHaveProperty('user', user);
  });

  it('distingue autenticación de autorización por rol', async () => {
    const user: SessionActor = {
      usuarioId: 'usuario-1',
      rol: 'comprador',
      issuedAt: new Date('2026-01-01T00:00:00Z'),
      expiresAt: new Date('2027-01-01T00:00:00Z'),
    };
    const guard = new BearerAuthGuard(
      { resolve: vi.fn().mockResolvedValue(user) } as unknown as SessionService,
      reflectorWith({ roles: ['administrador'] }),
    );

    await expect(guard.canActivate(contextFor(`Bearer ${TOKEN}`).context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('exige conjuntamente rol bodega y asociación', async () => {
    const malformedBodega = {
      usuarioId: 'usuario-1',
      rol: 'bodega',
      issuedAt: new Date('2026-01-01T00:00:00Z'),
      expiresAt: new Date('2027-01-01T00:00:00Z'),
    } satisfies SessionActor;
    const guard = new BearerAuthGuard(
      { resolve: vi.fn().mockResolvedValue(malformedBodega) } as unknown as SessionService,
      reflectorWith({ bodega: true }),
    );

    await expect(guard.canActivate(contextFor(`Bearer ${TOKEN}`).context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
