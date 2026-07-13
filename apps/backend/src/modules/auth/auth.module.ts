import { Module } from '@nestjs/common';
import { LoginRateLimitService } from '../../common/security/login-rate-limit.service.js';
import { SessionService } from '../../common/security/session.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, SessionService, LoginRateLimitService],
})
export class AuthModule {}
