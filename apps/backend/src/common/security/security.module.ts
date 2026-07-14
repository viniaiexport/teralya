import { Global, Module } from '@nestjs/common';
import { BearerAuthGuard } from './bearer-auth.guard.js';
import { SessionService } from './session.service.js';

@Global()
@Module({
  providers: [SessionService, BearerAuthGuard],
  exports: [SessionService, BearerAuthGuard],
})
export class SecurityModule {}
