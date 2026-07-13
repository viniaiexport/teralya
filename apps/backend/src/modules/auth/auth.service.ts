import { ConflictException, Injectable } from '@nestjs/common';
import { hashPassword } from '../../common/security/password.util.js';
import { SessionService } from '../../common/security/session.service.js';
import { AuthRepository, EmailYaRegistradoError } from './auth.repository.js';
import type { AuthSession } from './dto/auth-session.dto.js';
import type { RegisterBuyerRequestDto } from './dto/register-buyer-request.dto.js';

const IDIOMA_POR_DEFECTO = 'es';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionService: SessionService,
  ) {}

  async registrarComprador(request: RegisterBuyerRequestDto): Promise<AuthSession> {
    const passwordHash = await hashPassword(request.password);

    let comprador;
    try {
      comprador = await this.authRepository.registrarComprador({
        email: request.email,
        passwordHash,
        nombre: request.nombre,
        apellidos: request.apellidos,
        idioma: request.idioma ?? IDIOMA_POR_DEFECTO,
        fechaNacimiento: request.fecha_nacimiento,
        declaracionMayoriaEdad: request.declaracion_mayoria_edad,
        aceptacionCondicionesAlcohol: request.aceptacion_condiciones_alcohol,
      });
    } catch (error) {
      if (error instanceof EmailYaRegistradoError) {
        throw new ConflictException({ code: 'CONFLICT', message: 'El email ya está registrado.' });
      }
      throw error;
    }

    const session = await this.sessionService.issue({ usuarioId: comprador.id, rol: 'comprador' });

    return {
      access_token: session.accessToken,
      token_type: 'Bearer',
      expires_in: session.expiresIn,
      expires_at: session.expiresAt.toISOString(),
      usuario: {
        id: comprador.id,
        email: comprador.email,
        rol: 'comprador',
        idioma: comprador.idioma,
        estado: comprador.estado,
      },
    };
  }
}
