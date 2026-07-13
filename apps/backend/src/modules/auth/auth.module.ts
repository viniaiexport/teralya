import { Module } from '@nestjs/common';
import { SessionService } from '../../common/security/session.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, SessionService],
})
export class AuthModule {}
