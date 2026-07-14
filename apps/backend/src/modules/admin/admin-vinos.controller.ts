import { Controller,Get,HttpCode,HttpStatus,Param,Post,Query,UseGuards } from '@nestjs/common';
import { CurrentActor,Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { AdminVinosService } from './admin-vinos.service.js';
import { AdminVinosQueryDto } from './dto/admin-vinos-query.dto.js';
import type { PageWineAdminSummary,WineAdminDetail } from './dto/vino-admin.dto.js';
@Controller('admin/vinos') @UseGuards(BearerAuthGuard) @Roles('administrador')
export class AdminVinosController{constructor(private readonly service:AdminVinosService){}@Get() listar(@Query() query:AdminVinosQueryDto):Promise<PageWineAdminSummary>{return this.service.listar(query.page,query.page_size);}@Get(':id') obtener(@Param('id') id:string):Promise<WineAdminDetail>{return this.service.obtener(id);}@Post(':id/publicar') @HttpCode(HttpStatus.OK) publicar(@Param('id') id:string,@CurrentActor() actor:SessionActor):Promise<WineAdminDetail>{return this.service.publicar(id,actor.usuarioId);}@Post(':id/despublicar') @HttpCode(HttpStatus.OK) despublicar(@Param('id') id:string,@CurrentActor() actor:SessionActor):Promise<WineAdminDetail>{return this.service.despublicar(id,actor.usuarioId);}}
