import { Body,Controller,Delete,Get,Headers,HttpCode,HttpStatus,Param,Patch,Post,Query,Res,UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentActor,Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { DireccionesService } from './direcciones.service.js';
import type { AddressDto } from './dto/address.dto.js';
import { AddressCreateRequestDto,AddressPatchRequestDto,AddressQueryDto } from './dto/address-request.dto.js';
@Controller('direcciones') @UseGuards(BearerAuthGuard) @Roles('comprador','bodega')
export class DireccionesController{
 constructor(private readonly service:DireccionesService){}
 @Post() async crear(@CurrentActor() actor:SessionActor,@Headers('idempotency-key') key:string|undefined,@Body() body:AddressCreateRequestDto,@Res({passthrough:true}) response:Response):Promise<AddressDto>{const result=await this.service.crear(actor,key??'',body);response.status(result.replayed?HttpStatus.OK:HttpStatus.CREATED);return result.address;}
 @Get() listar(@CurrentActor() actor:SessionActor,@Query() query:AddressQueryDto):Promise<AddressDto[]>{return this.service.listar(actor,query.uso);}
 @Patch(':id') actualizar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:AddressPatchRequestDto):Promise<AddressDto>{return this.service.actualizar(actor,id,body);}
 @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) desactivar(@CurrentActor() actor:SessionActor,@Param('id') id:string):Promise<void>{return this.service.desactivar(actor,id);}
}
