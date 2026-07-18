import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';
import type { AddressSnapshot, OrderLine, SubOrderState } from './dto/subpedido.dto.js';

export interface SubOrderRecord {
  id:string; pedido_id:string; bodega_id:string; estado:SubOrderState; subtotal:string; gastos_envio:string; impuestos:string; total:string;
  fecha_ultimo_cambio_estado:Date|string; direccion_envio_snapshot:AddressSnapshot; pedido_estado:'pendiente_pago'|'pagado'|'en_preparacion'|'parcialmente_enviado'|'enviado'|'entregado'|'cancelado'|'devuelto';
  transportista:string|null; numero_seguimiento:string|null; fecha_preparacion:Date|string|null; fecha_envio:Date|string|null; fecha_entrega_prevista:Date|string|null; fecha_entrega_real:Date|string|null; lineas:OrderLine[];
}
export type OwnedResult={kind:'ok';suborder:SubOrderRecord}|{kind:'missing'}|{kind:'foreign'};
export type TransitionResult=OwnedResult|{kind:'conflict'};
const TRANSITIONS:Record<SubOrderState,readonly SubOrderState[]>={pendiente:['aceptado','cancelado','incidencia'],aceptado:['en_preparacion','cancelado','incidencia'],en_preparacion:['enviado','cancelado','incidencia'],incidencia:['en_preparacion','cancelado'],enviado:['entregado'],entregado:[],cancelado:[]};
export const isSubOrderTransitionAllowed=(from:SubOrderState,to:SubOrderState):boolean=>from===to||TRANSITIONS[from].includes(to);
export const deriveOrderState=(states:SubOrderState[]):'pagado'|'en_preparacion'|'parcialmente_enviado'|'enviado'|'entregado'|'cancelado'=>{if(states.every(state=>state==='cancelado'))return'cancelado';const active=states.filter(state=>state!=='cancelado');if(active.every(state=>state==='entregado'))return'entregado';if(active.every(state=>state==='enviado'||state==='entregado'))return active.some(state=>state==='enviado')?'enviado':'entregado';if(active.some(state=>state==='enviado'||state==='entregado'))return'parcialmente_enviado';if(active.some(state=>state==='aceptado'||state==='en_preparacion'||state==='incidencia'))return'en_preparacion';return'pagado';};
const BASE=`SELECT s.id,s.pedido_id,s.bodega_id,s.estado,s.subtotal::text,s.gastos_envio::text,s.impuestos::text,s.total::text,s.fecha_ultimo_cambio_estado,p.direccion_envio_snapshot,p.estado pedido_estado,s.transportista,s.numero_seguimiento,s.fecha_preparacion,s.fecha_envio,s.fecha_entrega_prevista,s.fecha_entrega_real,coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',i.id,'vino_id',i.vino_id,'nombre_vino',i.nombre_vino_snapshot,'bodega',i.bodega_snapshot,'precio_unitario',to_char(i.precio_unitario,'FM99999999.00'),'cantidad',i.cantidad,'importe_total',to_char(i.importe_total,'FM99999999.00'),'anada',i.anada_snapshot)) ORDER BY i.created_at,i.id) FROM pedido_item i WHERE i.subpedido_id=s.id),'[]'::jsonb) lineas FROM subpedido s JOIN pedido p ON p.id=s.pedido_id`;

@Injectable()
export class SubpedidosRepository {
  constructor(private readonly database:DatabaseService){}
  async bodegaPuedeOperar(id:string):Promise<boolean>{const rows=await this.database.query<{allowed:boolean}>("SELECT EXISTS(SELECT 1 FROM bodega WHERE id=$1 AND estado IN ('aprobada','activa')) allowed",[id]);return rows[0]?.allowed??false;}
  async listar(bodegaId:string,page:number,pageSize:number):Promise<{items:SubOrderRecord[];total:number}>{const offset=(page-1)*pageSize;const [items,count]=await Promise.all([this.database.query<SubOrderRecord>(`${BASE} WHERE s.bodega_id=$1 ORDER BY s.fecha_ultimo_cambio_estado DESC,s.id LIMIT $2 OFFSET $3`,[bodegaId,pageSize,offset]),this.database.query<{total:number}>(`SELECT count(*)::int total FROM subpedido WHERE bodega_id=$1`,[bodegaId])]);return{items,total:count[0]?.total??0};}
  async obtener(id:string,bodegaId:string):Promise<OwnedResult>{const rows=await this.database.query<SubOrderRecord>(`${BASE} WHERE s.id=$1`,[id]);return this.owned(rows[0],bodegaId);}
  cambiarEstado(id:string,bodegaId:string,userId:string,destination:SubOrderState):Promise<TransitionResult>{return this.database.withTransaction(async c=>{
    const probeRows=await c.query<{id:string;pedido_id:string;bodega_id:string}>('SELECT id,pedido_id,bodega_id FROM subpedido WHERE id=$1',[id]);const probe=probeRows.rows[0];if(probe===undefined)return{kind:'missing'};if(probe.bodega_id!==bodegaId)return{kind:'foreign'};
    await c.query('SELECT id FROM pedido WHERE id=$1 FOR UPDATE',[probe.pedido_id]);
    const cancellation=await c.query<{id:string}>("SELECT id FROM cancelacion_pedido WHERE pedido_id=$1 AND estado IN ('procesando','completada') FOR UPDATE",[probe.pedido_id]);if(cancellation.rows[0]!==undefined)return{kind:'conflict'};
    const siblings=await c.query<{id:string;pedido_id:string;bodega_id:string;estado:SubOrderState}>('SELECT id,pedido_id,bodega_id,estado FROM subpedido WHERE pedido_id=$1 ORDER BY id FOR UPDATE',[probe.pedido_id]);const current=siblings.rows.find(row=>row.id===id);if(current===undefined)return{kind:'missing'};if(current.estado===destination)return this.load(c,id);
    if(!isSubOrderTransitionAllowed(current.estado,destination))return{kind:'conflict'};
    await c.query(`UPDATE subpedido SET estado=$2::estado_subpedido,fecha_ultimo_cambio_estado=now(),updated_at=now(),fecha_preparacion=CASE WHEN $2::text='en_preparacion' AND fecha_preparacion IS NULL THEN now() ELSE fecha_preparacion END,fecha_envio=CASE WHEN $2::text='enviado' AND fecha_envio IS NULL THEN now() ELSE fecha_envio END,fecha_entrega_real=CASE WHEN $2::text='entregado' AND fecha_entrega_real IS NULL THEN now() ELSE fecha_entrega_real END WHERE id=$1`,[id,destination]);
    const parent=deriveOrderState(siblings.rows.map(row=>row.id===id?destination:row.estado));await c.query('UPDATE pedido SET estado=$2::estado_pedido,updated_at=now(),fecha_cierre=CASE WHEN $2::text IN (\'entregado\',\'cancelado\') THEN coalesce(fecha_cierre,now()) ELSE fecha_cierre END WHERE id=$1',[current.pedido_id,parent]);
    await c.query(`INSERT INTO auditoria(usuario_id,tipo_entidad,entidad_id,accion,valor_anterior,valor_nuevo,descripcion) VALUES($1,'subpedido',$2,'cambio_estado',jsonb_build_object('estado',$3::text),jsonb_build_object('estado',$4::text),'Cambio logístico de subpedido')`,[userId,id,current.estado,destination]);return this.load(c,id);
  });}
  private async load(c:PoolClient,id:string):Promise<TransitionResult>{const result=await c.query<SubOrderRecord>(`${BASE} WHERE s.id=$1`,[id]);const suborder=result.rows[0];return suborder===undefined?{kind:'missing'}:{kind:'ok',suborder};}
  private owned(row:SubOrderRecord|undefined,bodegaId:string):OwnedResult{if(row===undefined)return{kind:'missing'};return row.bodega_id===bodegaId?{kind:'ok',suborder:row}:{kind:'foreign'};}
}
