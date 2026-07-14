import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { SessionActor } from '../../common/security/session.service.js';
import type { SubOrderQueryDto } from './dto/subpedido-request.dto.js';
import type { PageSubOrderSummary, SubOrderDetail, SubOrderState, SubOrderSummary, Tracking } from './dto/subpedido.dto.js';
import { SubpedidosRepository, type OwnedResult, type SubOrderRecord, type TransitionResult } from './subpedidos.repository.js';

@Injectable()
export class SubpedidosService {
  constructor(private readonly repository:SubpedidosRepository){}
  async listar(actor:SessionActor,query:SubOrderQueryDto):Promise<PageSubOrderSummary>{const bodegaId=await this.operationalBodega(actor);const result=await this.repository.listar(bodegaId,query.page,query.page_size);return{items:result.items.map(row=>this.summary(row)),page:query.page,page_size:query.page_size,total_items:result.total,total_pages:Math.ceil(result.total/query.page_size)};}
  async obtener(actor:SessionActor,id:string):Promise<SubOrderDetail>{this.validId(id);return this.detail(this.resolve(await this.repository.obtener(id,await this.operationalBodega(actor))));}
  async cambiarEstado(actor:SessionActor,id:string,destination:SubOrderState):Promise<SubOrderDetail>{this.validId(id);const result=await this.repository.cambiarEstado(id,await this.operationalBodega(actor),actor.usuarioId,destination);if(result.kind==='conflict')throw new ConflictException({code:'CONFLICT',message:'La transición logística solicitada no está permitida.'});return this.detail(this.resolve(result));}
  private bodegaId(actor:SessionActor):string{if(actor.rol!=='bodega'||actor.bodegaId===undefined)throw new ForbiddenException({code:'FORBIDDEN',message:'La sesión no está asociada a una bodega.'});return actor.bodegaId;}
  private async operationalBodega(actor:SessionActor):Promise<string>{const id=this.bodegaId(actor);if(!await this.repository.bodegaPuedeOperar(id))throw new ForbiddenException({code:'FORBIDDEN',message:'La bodega no está validada para operar.'});return id;}
  private resolve(result:OwnedResult|TransitionResult):SubOrderRecord{if(result.kind==='missing')this.notFound();if(result.kind==='foreign')throw new ForbiddenException({code:'FORBIDDEN',message:'El subpedido pertenece a otra bodega.'});if(result.kind==='conflict')throw new ConflictException({code:'CONFLICT',message:'La transición logística solicitada no está permitida.'});return result.suborder;}
  private validId(id:string):void{if(!isUUID(id))this.notFound();}
  private notFound():never{throw new NotFoundException({code:'RESOURCE_NOT_FOUND',message:'Subpedido no encontrado.'});}
  private summary(row:SubOrderRecord):SubOrderSummary{return{id:row.id,pedido_id:row.pedido_id,estado:row.estado,total:row.total,moneda:'EUR',fecha_ultimo_cambio_estado:this.iso(row.fecha_ultimo_cambio_estado)};}
  private detail(row:SubOrderRecord):SubOrderDetail{return{...this.summary(row),totales:{subtotal:row.subtotal,gastos_envio:row.gastos_envio,impuestos:row.impuestos,total:row.total,moneda:'EUR'},lineas:row.lineas,direccion_envio_snapshot:row.direccion_envio_snapshot,tracking:this.tracking(row),pedido_estado:row.pedido_estado};}
  private tracking(row:SubOrderRecord):Tracking{return{...this.optional(row.transportista,'transportista'),...this.optional(row.numero_seguimiento,'numero_seguimiento'),...this.date(row.fecha_preparacion,'fecha_preparacion'),...this.date(row.fecha_envio,'fecha_envio'),...this.date(row.fecha_entrega_prevista,'fecha_entrega_prevista'),...this.date(row.fecha_entrega_real,'fecha_entrega_real')};}
  private optional(value:string|null,key:string):Record<string,string>{return value===null?{}:{[key]:value};}
  private date(value:Date|string|null,key:string):Record<string,string>{return value===null?{}:{[key]:this.iso(value)};}
  private iso(value:Date|string):string{return new Date(value).toISOString();}
}
