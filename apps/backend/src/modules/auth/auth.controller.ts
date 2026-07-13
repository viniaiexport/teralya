import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthSession } from './dto/auth-session.dto.js';
import { RegisterBuyerRequestDto } from './dto/register-buyer-request.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** API-001 — POST /auth/registro/comprador (contrato: teralya-openapi-v1.0.yaml). */
  @Post('registro/comprador')
  @HttpCode(HttpStatus.CREATED)
  async registrarComprador(@Body() body: RegisterBuyerRequestDto): Promise<AuthSession> {
    return this.authService.registrarComprador(body);
  }
}
