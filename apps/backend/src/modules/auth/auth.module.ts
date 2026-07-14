import { Module } from '@nestjs/common';
import { PasswordRecoveryMailService } from '../../common/notifications/password-recovery-mail.service.js';
import { LoginRateLimitService } from '../../common/security/login-rate-limit.service.js';
import { PasswordRecoveryRateLimitService } from '../../common/security/password-recovery-rate-limit.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { PasswordRecoveryRepository } from './password-recovery.repository.js';
import { PasswordRecoveryService } from './password-recovery.service.js';
import { PasswordResetRepository } from './password-reset.repository.js';
import { PasswordResetService } from './password-reset.service.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    LoginRateLimitService,
    PasswordRecoveryService,
    PasswordRecoveryRepository,
    PasswordRecoveryRateLimitService,
    PasswordRecoveryMailService,
    PasswordResetService,
    PasswordResetRepository,
  ],
})
export class AuthModule {}
