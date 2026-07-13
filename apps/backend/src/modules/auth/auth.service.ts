import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from '../../common/security/password.util.js';
import { SessionService } from '../../common/security/session.service.js';
import { AuthRepository, EmailYaRegistradoError } from './auth.repository.js';
import type { AuthSession } from './dto/auth-session.dto.js';
import type { RegisterBuyerRequestDto } from './dto/register-buyer-request.dto.js';

const IDIOMA_POR_DEFECTO = 'es';

function calculateAge(dateOfBirth: string, today: Date): number {
  const [yearRaw, monthRaw, dayRaw] = dateOfBirth.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const currentDay = today.getUTCDate();
  const birthdayPending = month > currentMonth || (month === currentMonth && day > currentDay);

  return currentYear - year - (birthdayPending ? 1 : 0);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async registrarComprador(request: RegisterBuyerRequestDto): Promise<AuthSession> {
    const minimumAge = this.configService.getOrThrow<number>('MINIMUM_PURCHASE_AGE');
    if (calculateAge(request.fecha_nacimiento, new Date()) < minimumAge) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'No se cumple la edad mínima configurada.',
      });
    }

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
        versionCondicionesAlcohol: this.configService.getOrThrow<string>('ALCOHOL_TERMS_VERSION'),
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
