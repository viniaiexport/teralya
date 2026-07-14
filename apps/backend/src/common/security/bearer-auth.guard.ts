import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Response } from 'express';
import {
  AUTH_BODEGA_ASSOCIATION_METADATA,
  AUTH_ROLES_METADATA,
} from './auth.decorators.js';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { SessionService } from './session.service.js';
import type { SessionActor } from './session.service.js';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.parseAuthorization(request.headers.authorization);
    const actor = token === null ? null : await this.sessionService.resolve(token);
    if (actor === null) {
      context.switchToHttp().getResponse<Response>().setHeader('WWW-Authenticate', 'Bearer');
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Se requiere una sesión Bearer válida.',
      });
    }

    const roles = this.reflector.getAllAndOverride<SessionActor['rol'][] | undefined>(
      AUTH_ROLES_METADATA,
      [context.getHandler(), context.getClass()],
    );
    const requiresBodega = this.reflector.getAllAndOverride<boolean | undefined>(
      AUTH_BODEGA_ASSOCIATION_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (roles !== undefined && !roles.includes(actor.rol)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'El rol no permite realizar esta operación.' });
    }
    if (requiresBodega === true && (actor.rol !== 'bodega' || actor.bodegaId === undefined)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La sesión no está asociada a una bodega.' });
    }

    (request as AuthenticatedRequest).user = actor;
    return true;
  }

  private parseAuthorization(value: string | undefined): string | null {
    if (value === undefined) {
      return null;
    }
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(value);
    return match?.[1] ?? null;
  }
}
