import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordRecoveryMailService } from '../../common/notifications/password-recovery-mail.service.js';
import { PasswordRecoveryRateLimitService } from '../../common/security/password-recovery-rate-limit.service.js';
import type { GenericAck } from './dto/generic-ack.dto.js';
import type { PasswordRecoveryRequestDto } from './dto/password-recovery-request.dto.js';
import { PasswordRecoveryRepository } from './password-recovery.repository.js';

const GENERIC_MESSAGE =
  'Si existe una cuenta asociada, recibirás instrucciones para restablecer la contraseña.';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly repository: PasswordRecoveryRepository,
    private readonly rateLimitService: PasswordRecoveryRateLimitService,
    private readonly mailService: PasswordRecoveryMailService,
    private readonly configService: ConfigService,
  ) {}

  async request(request: PasswordRecoveryRequestDto, requestId: string): Promise<GenericAck> {
    await this.rateLimitService.consume(request.email);

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const usuario = await this.repository.buscarUsuarioPorEmail(request.email);

    if (usuario === null) {
      await this.repository.registrarSolicitudSinCuenta();
      return this.ack(requestId);
    }

    const ttlSeconds = this.configService.getOrThrow<number>('PASSWORD_RECOVERY_TOKEN_TTL_SECONDS');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1_000);
    const creada = await this.repository.crearSolicitud(usuario.id, tokenHash, expiresAt);

    try {
      await this.mailService.send(usuario.email, token);
      await this.repository.marcarNotificacionEnviada(creada.notificacionId);
    } catch {
      await this.repository.marcarEnvioFallido(
        usuario.id,
        creada.solicitudId,
        creada.notificacionId,
      );
    }

    return this.ack(requestId);
  }

  private ack(requestId: string): GenericAck {
    return { message: GENERIC_MESSAGE, request_id: requestId };
  }
}
