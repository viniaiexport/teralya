import { createParamDecorator, SetMetadata } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request.js';
import type { SessionActor } from './session.service.js';

export const AUTH_ROLES_METADATA = 'teralya:auth:roles';
export const AUTH_BODEGA_ASSOCIATION_METADATA = 'teralya:auth:bodega-association';

export const Roles = (...roles: SessionActor['rol'][]): MethodDecorator & ClassDecorator =>
  SetMetadata(AUTH_ROLES_METADATA, roles);

/** Exige una sesión de rol bodega que contenga la bodega asociada. */
export const BodegaAuthenticated = (): MethodDecorator & ClassDecorator =>
  SetMetadata(AUTH_BODEGA_ASSOCIATION_METADATA, true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionActor =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);

export const CurrentActor = CurrentUser;
