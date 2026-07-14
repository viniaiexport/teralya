import { BadRequestException,ConflictException,Injectable,NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CarritoRepository } from './carrito.repository.js';
import type { CartRequestDto } from './dto/cart-request.dto.js';
import type { CartDto,CartMutationResponse } from './dto/cart.dto.js';

@Injectable()
export class CarritoService{
 constructor(private readonly repository:CarritoRepository){}
 async get(owner:string):Promise<CartDto>{return this.resolve(await this.repository.get(owner));}
 async add(owner:string,input:CartRequestDto):Promise<CartMutationResponse>{const ordinary=input.vino_id!==undefined&&input.cantidad!==undefined&&input.fusion_id===undefined&&input.items===undefined;const merge=input.fusion_id!==undefined&&input.items!==undefined&&input.vino_id===undefined&&input.cantidad===undefined;if(!ordinary&&!merge)throw new BadRequestException({code:'VALIDATION_ERROR',message:'Debe enviar una adición ordinaria o una fusión completa.'});if(ordinary){const vinoId=input.vino_id;const quantity=input.cantidad;if(vinoId===undefined||quantity===undefined)throw new Error('Adición ordinaria inválida.');return this.resolve(await this.repository.add(owner,vinoId,quantity));}const fusionId=input.fusion_id;const items=input.items;if(fusionId===undefined||items===undefined)throw new Error('Fusión inválida.');const seen=new Set(items.map(i=>i.vino_id));if(seen.size!==items.length)throw new BadRequestException({code:'VALIDATION_ERROR',message:'vino_id debe ser único en la fusión.'});return this.resolve(await this.repository.merge(owner,fusionId,items));}
 async patch(owner:string,id:string,q:number):Promise<CartDto>{this.uuid(id);return this.resolve(await this.repository.patch(owner,id,q));}
 async remove(owner:string,id:string):Promise<CartDto>{this.uuid(id);return this.resolve(await this.repository.remove(owner,id));}
 async empty(owner:string):Promise<CartDto>{return this.resolve(await this.repository.empty(owner));}
 private resolve<T>(r:{kind:'ok';value:T}|{kind:'missing'}|{kind:'conflict';message:string}):T{if(r.kind==='missing')throw new NotFoundException({code:'RESOURCE_NOT_FOUND',message:'Carrito, línea o vino no encontrado.'});if(r.kind==='conflict')throw new ConflictException({code:'CONFLICT',message:r.message});return r.value;}
 private uuid(id:string):void{if(!isUUID(id))throw new NotFoundException({code:'RESOURCE_NOT_FOUND',message:'Línea no encontrada.'});}
}
