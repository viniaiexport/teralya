import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { BodegaAuthenticated, CurrentActor, Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { SubOrderQueryDto, SubOrderStatePatchDto } from './dto/subpedido-request.dto.js';
import type { PageSubOrderSummary, SubOrderDetail } from './dto/subpedido.dto.js';
import { SubpedidosService } from './subpedidos.service.js';

@Controller('bodegas/yo/subpedidos')
@UseGuards(BearerAuthGuard)
@Roles('bodega')
@BodegaAuthenticated()
export class SubpedidosController {
  constructor(private readonly service:SubpedidosService) {}
  @Get() listar(@CurrentActor() actor:SessionActor,@Query() query:SubOrderQueryDto):Promise<PageSubOrderSummary>{return this.service.listar(actor,query);}
  @Get(':id') obtener(@CurrentActor() actor:SessionActor,@Param('id') id:string):Promise<SubOrderDetail>{return this.service.obtener(actor,id);}
  @Patch(':id/estado') cambiarEstado(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:SubOrderStatePatchDto):Promise<SubOrderDetail>{return this.service.cambiarEstado(actor,id,body.estado_destino);}
}
