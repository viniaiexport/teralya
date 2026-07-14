import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword, verifyPassword } from '../../common/security/password.util.js';
import { LoginRateLimitService } from '../../common/security/login-rate-limit.service.js';
import { SessionService } from '../../common/security/session.service.js';
import {
  AuthRepository,
  EmailYaRegistradoError,
  type UsuarioAutenticacion,
} from './auth.repository.js';
import type { AuthSession, UsuarioSesion } from './dto/auth-session.dto.js';
import type { LoginRequestDto } from './dto/login-request.dto.js';
import type { RegisterBuyerRequestDto } from './dto/register-buyer-request.dto.js';

const IDIOMA_POR_DEFECTO = 'es';
const ESTADOS_BODEGA_CON_ACCESO = new Set(['aprobada', 'activa']);

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
    private readonly loginRateLimitService: LoginRateLimitService,
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

  async login(request: LoginRequestDto): Promise<AuthSession> {
    await this.loginRateLimitService.consume(request.email);
    const usuarioInicial = await this.authRepository.buscarUsuarioPorEmail(request.email);

    if (usuarioInicial === null) {
      await hashPassword(request.password);
      await this.authRepository.registrarRechazoAutenticacion(null, false);
      this.lanzarCredencialesIncorrectas();
    }

    return this.sessionService.withIssuanceBlocked(usuarioInicial.id, async (blockOwner) => {
      // El usuario se vuelve a leer dentro de la exclusión mutua. Así, si un
      // restablecimiento terminó mientras el login esperaba, nunca se valida
      // contra el hash antiguo capturado antes del cambio.
      const usuario = await this.authRepository.buscarUsuarioPorEmail(request.email);
      if (usuario === null || usuario.id !== usuarioInicial.id) {
        await this.authRepository.registrarRechazoAutenticacion(null, false);
        this.lanzarCredencialesIncorrectas();
      }

      let passwordValida = false;
      try {
        passwordValida = await verifyPassword(request.password, usuario.passwordHash);
      } catch {
        passwordValida = false;
      }

      if (!passwordValida) {
        await this.authRepository.registrarRechazoAutenticacion(usuario.id, true);
        this.lanzarCredencialesIncorrectas();
      }

      if (usuario.estado !== 'activo' || usuario.cuentaBloqueada) {
        await this.authRepository.registrarRechazoAutenticacion(usuario.id, false);
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La cuenta no tiene acceso habilitado.' });
      }

      if (
        usuario.rol === 'bodega' &&
        (usuario.bodegaId === null ||
          usuario.bodegaEstado === null ||
          !ESTADOS_BODEGA_CON_ACCESO.has(usuario.bodegaEstado))
      ) {
        await this.authRepository.registrarRechazoAutenticacion(usuario.id, false);
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La bodega no está validada para operar.' });
      }

      await this.authRepository.registrarAccesoCorrecto(usuario.id);
      const session = await this.sessionService.issue(
        {
          usuarioId: usuario.id,
          rol: usuario.rol,
          ...(usuario.bodegaId === null ? {} : { bodegaId: usuario.bodegaId }),
        },
        blockOwner,
      );
      await this.loginRateLimitService.reset(request.email);

      return {
        access_token: session.accessToken,
        token_type: 'Bearer',
        expires_in: session.expiresIn,
        expires_at: session.expiresAt.toISOString(),
        usuario: this.usuarioSesion(usuario),
      };
    });
  }

  private usuarioSesion(usuario: UsuarioAutenticacion): UsuarioSesion {
    return {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      idioma: usuario.idioma,
      estado: usuario.estado,
      ...(usuario.nombre === null ? {} : { nombre: usuario.nombre }),
      ...(usuario.apellidos === null ? {} : { apellidos: usuario.apellidos }),
      ...(usuario.bodegaId === null ? {} : { bodega_id: usuario.bodegaId }),
    };
  }

  private lanzarCredencialesIncorrectas(): never {
    throw new UnauthorizedException({
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Las credenciales proporcionadas no son válidas.',
    });
  }
}
