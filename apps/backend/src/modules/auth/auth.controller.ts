import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { REQUEST_ID_HEADER } from '../../common/http/request-id.middleware.js';
import { AuthService } from './auth.service.js';
import type { AuthSession } from './dto/auth-session.dto.js';
import type { GenericAck } from './dto/generic-ack.dto.js';
import { LoginRequestDto } from './dto/login-request.dto.js';
import { PasswordRecoveryRequestDto } from './dto/password-recovery-request.dto.js';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto.js';
import { RegisterBuyerRequestDto } from './dto/register-buyer-request.dto.js';
import { PasswordRecoveryService } from './password-recovery.service.js';
import { PasswordResetService } from './password-reset.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  /** API-001 — POST /auth/registro/comprador (contrato: teralya-openapi-v1.1.yaml). */
  @Post('registro/comprador')
  @HttpCode(HttpStatus.CREATED)
  async registrarComprador(@Body() body: RegisterBuyerRequestDto): Promise<AuthSession> {
    return this.authService.registrarComprador(body);
  }

  /** API-002 — POST /auth/login (contrato: teralya-openapi-v1.1.yaml). */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequestDto): Promise<AuthSession> {
    return this.authService.login(body);
  }

  /** API-003 — POST /auth/recuperar-password (contrato: teralya-openapi-v1.1.yaml). */
  @Post('recuperar-password')
  @HttpCode(HttpStatus.OK)
  async recuperarPassword(
    @Body() body: PasswordRecoveryRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GenericAck> {
    return this.passwordRecoveryService.request(
      body,
      String(response.getHeader(REQUEST_ID_HEADER)),
    );
  }

  /** API-004 — POST /auth/restablecer-password (contrato: teralya-openapi-v1.1.yaml). */
  @Post('restablecer-password')
  @HttpCode(HttpStatus.OK)
  async restablecerPassword(
    @Body() body: PasswordResetRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GenericAck> {
    return this.passwordResetService.reset(body, String(response.getHeader(REQUEST_ID_HEADER)));
  }
}
