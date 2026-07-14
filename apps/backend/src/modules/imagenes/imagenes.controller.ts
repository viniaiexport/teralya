import { Body,Controller,Delete,HttpCode,HttpStatus,Param,Patch,Post,Res,UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentActor,Roles } from '../../common/security/auth.decorators.js';
import { BearerAuthGuard } from '../../common/security/bearer-auth.guard.js';
import type { SessionActor } from '../../common/security/session.service.js';
import { ImageConfirmRequestDto,ImagePatchRequestDto,UploadRequestDto } from './dto/image-request.dto.js';
import type { ImageDto,UploadAuthorization } from './dto/image.dto.js';
import { ImagenesService } from './imagenes.service.js';
@Controller('bodegas/yo/vinos/:id/imagenes') @UseGuards(BearerAuthGuard) @Roles('bodega')
export class ImagenesController{
 constructor(private readonly service:ImagenesService){}
 @Post('upload-url') autorizar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:UploadRequestDto):Promise<UploadAuthorization>{return this.service.autorizar(actor,id,body);}
 @Post() async confirmar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Body() body:ImageConfirmRequestDto,@Res({passthrough:true}) response:Response):Promise<ImageDto>{const result=await this.service.confirmar(actor,id,body);response.status(result.replayed?HttpStatus.OK:HttpStatus.CREATED);return result.image;}
 @Patch(':imagen_id') actualizar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Param('imagen_id') imageId:string,@Body() body:ImagePatchRequestDto):Promise<ImageDto>{return this.service.actualizar(actor,id,imageId,body);}
 @Delete(':imagen_id') @HttpCode(HttpStatus.NO_CONTENT) desactivar(@CurrentActor() actor:SessionActor,@Param('id') id:string,@Param('imagen_id') imageId:string):Promise<void>{return this.service.desactivar(actor,id,imageId);}
}
