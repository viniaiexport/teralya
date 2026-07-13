import { Module } from '@nestjs/common';
import { PasswordRecoveryMailService } from '../../common/notifications/password-recovery-mail.service.js';
import { LoginRateLimitService } from '../../common/security/login-rate-limit.service.js';
import { PasswordRecoveryRateLimitService } from '../../common/security/password-recovery-rate-limit.service.js';
import { SessionService } from '../../common/security/session.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { PasswordRecoveryRepository } from './password-recovery.repository.js';
import { PasswordRecoveryService } from './password-recovery.service.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    SessionService,
    LoginRateLimitService,
    PasswordRecoveryService,
    PasswordRecoveryRepository,
    PasswordRecoveryRateLimitService,
    PasswordRecoveryMailService,
  ],
})
export class AuthModule {}
