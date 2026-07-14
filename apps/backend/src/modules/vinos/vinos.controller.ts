import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentActor, Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { WineOwnQueryDto, WineWriteRequestDto } from './dto/wine-request.dto.js';
import type { PageWineOwnSummary, WineOwnDetail } from './dto/wine.dto.js';
import { VinosService } from './vinos.service.js';

@Controller('bodegas/yo/vinos') @UseGuards(BearerAuthGuard) @Roles('bodega')
export class VinosController {
  constructor(private readonly service: VinosService) {}
  @Post() crear(@CurrentActor() actor:SessionActor,@Body() body:WineWriteRequestDto):Promise<WineOwnDetail>{return this.service.crear(actor,body);}
  @Get() listar(@CurrentActor() actor:SessionActor,@Query() query:WineOwnQueryDto):Promise<PageWineOwnSummary>{return this.service.listar(actor,query);}
  @Put(':id') reemplazar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:WineWriteRequestDto):Promise<WineOwnDetail>{return this.service.reemplazar(actor,id,body);}
  @Get(':id') obtener(@CurrentActor() actor:SessionActor,@Param('id') id:string):Promise<WineOwnDetail>{return this.service.obtener(actor,id);}
  @Post(':id/solicitar-publicacion') @HttpCode(HttpStatus.OK) solicitar(@CurrentActor() actor:SessionActor,@Param('id') id:string):Promise<WineOwnDetail>{return this.service.solicitarPublicacion(actor,id);}
}
