import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { AdminDashboard } from './dto/admin-dashboard.dto.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Controller('admin/dashboard')
@UseGuards(BearerAuthGuard)
@Roles('administrador')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  obtener(): Promise<AdminDashboard> {
    return this.service.obtener();
  }
}
