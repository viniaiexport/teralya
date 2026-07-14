import { Body,Controller,Delete,Get,HttpCode,HttpStatus,Param,Patch,Post,UseGuards } from '@nestjs/common';
import { CurrentActor,Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { CarritoService } from './carrito.service.js';
import { CartRequestDto,QuantityPatchDto } from './dto/cart-request.dto.js';
import type { CartDto,CartMutationResponse } from './dto/cart.dto.js';

@Controller('carrito') @UseGuards(BearerAuthGuard) @Roles('comprador')
export class CarritoController{
 constructor(private readonly service:CarritoService){}
 @Post('items') @HttpCode(HttpStatus.OK) add(@CurrentActor() actor:SessionActor,@Body() body:CartRequestDto):Promise<CartMutationResponse>{return this.service.add(actor.usuarioId,body);}
 @Get() get(@CurrentActor() actor:SessionActor):Promise<CartDto>{return this.service.get(actor.usuarioId);}
 @Patch('items/:id') patch(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:QuantityPatchDto):Promise<CartDto>{return this.service.patch(actor.usuarioId,id,body.cantidad);}
 @Delete('items/:id') remove(@CurrentActor() actor:SessionActor,@Param('id') id:string):Promise<CartDto>{return this.service.remove(actor.usuarioId,id);}
 @Delete() empty(@CurrentActor() actor:SessionActor):Promise<CartDto>{return this.service.empty(actor.usuarioId);}
}
