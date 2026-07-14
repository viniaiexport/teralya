import { createHash } from 'node:crypto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '../../common/security/password.util.js';
import { SessionService } from '../../common/security/session.service.js';
import type { GenericAck } from './dto/generic-ack.dto.js';
import type { PasswordResetRequestDto } from './dto/password-reset-request.dto.js';
import { PasswordResetRepository } from './password-reset.repository.js';

const MENSAJE_EXITO = 'La contraseña se ha restablecido correctamente.';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly repository: PasswordResetRepository,
    private readonly sessionService: SessionService,
  ) {}

  async reset(request: PasswordResetRequestDto, requestId: string): Promise<GenericAck> {
    const tokenHash = createHash('sha256').update(request.token).digest('hex');
    // Se calcula el hash de la nueva contraseña antes de tocar la base de datos:
    // ninguna contraseña ni token en claro se registra en ningún punto de este flujo.
    const nuevoPasswordHash = await hashPassword(request.password_nueva);

    const usuarioId = await this.repository.buscarUsuarioIdPorTokenHash(tokenHash);
    if (usuarioId === null) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'El token indicado no existe.' });
    }

    const resultado = await this.sessionService.withIssuanceBlocked(usuarioId, () =>
      this.repository.consumirSolicitud(tokenHash, nuevoPasswordHash, (id) =>
        this.sessionService.revokeAllForUser(id),
      ),
    );

    switch (resultado.resultado) {
      case 'no_encontrada':
        throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'El token indicado no existe.' });
      case 'no_disponible':
        throw new ConflictException({
          code: 'CONFLICT',
          message: 'El token no es válido, ya fue utilizado o ha expirado.',
        });
      case 'restablecida':
        return { message: MENSAJE_EXITO, request_id: requestId };
    }
  }
}
