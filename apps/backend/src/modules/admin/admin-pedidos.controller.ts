import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import { AdminPedidosService } from './admin-pedidos.service.js';
import {
  AdminPedidosQueryDto,
  type OrderAdminDetail,
  type PageOrderSummary,
} from './dto/admin-pedidos.dto.js';

@Controller('admin/pedidos')
@UseGuards(BearerAuthGuard)
@Roles('administrador')
export class AdminPedidosController {
  constructor(private readonly service: AdminPedidosService) {}

  @Get()
  listar(@Query() query: AdminPedidosQueryDto): Promise<PageOrderSummary> {
    return this.service.listar(query.page, query.page_size);
  }

  @Get(':id')
  obtener(@Param('id') id: string): Promise<OrderAdminDetail> {
    return this.service.obtener(id);
  }
}
