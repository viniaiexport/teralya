import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';
import type { WineWriteRequestDto, WineState } from './dto/wine-request.dto.js';

export interface ImageRecord { id:string; url:string; es_principal:boolean; orden:number; alt_text:string; resolucion:string|null }
export interface WineRecord {
  id:string;bodega_id:string;nombre_comercial:string;slug:string|null;sku:string|null;tipo_vino:string|null;anada:number|null;pais:string|null;region:string|null;denominacion_origen:string|null;variedades_uva:string[]|null;crianza:string|null;meses_crianza:number|null;graduacion_alcoholica:string|null;volumen_ml:number|null;descripcion_corta:string|null;descripcion_completa:string|null;nota_cata:string|null;maridaje:string|null;temperatura_servicio:string|null;certificaciones:string[]|null;premios:string[]|null;produccion_limitada:boolean|null;precio:string;moneda:'EUR';stock_disponible:number;stock_reservado:number;stock_minimo:number;disponible_venta:boolean;peso_gramos:number|null;plazo_preparacion_dias:number|null;botellas_por_caja:number|null;estado:WineState;created_at:Date|string;updated_at:Date|string;bodega_nombre:string;bodega_slug:string|null;bodega_logo_url:string|null;bodega_region:string|null;bodega_pais:string|null;bodega_denominacion_origen:string|null;imagenes:ImageRecord[];
}
export type OwnedResult = {kind:'found';wine:WineRecord}|{kind:'foreign'}|{kind:'missing'};
export type PublicationResult = {kind:'updated';wine:WineRecord}|{kind:'missing'}|{kind:'conflict'}|{kind:'invalid'};
export interface WinePage {items:WineRecord[];total:number}

const WINE_COLUMNS = `v.id,v.bodega_id,v.nombre_comercial,v.slug,v.sku,v.tipo_vino,v.anada,v.pais,v.region,v.denominacion_origen,v.variedades_uva,v.crianza,v.meses_crianza,v.graduacion_alcoholica::text,v.volumen_ml,v.descripcion_corta,v.descripcion_completa,v.nota_cata,v.maridaje,v.temperatura_servicio,v.certificaciones,v.premios,v.produccion_limitada,v.precio::text,v.moneda,v.stock_disponible,v.stock_reservado,v.stock_minimo,v.disponible_venta,v.peso_gramos,v.plazo_preparacion_dias,v.botellas_por_caja,v.estado,v.created_at,v.updated_at,b.nombre_comercial AS bodega_nombre,b.slug AS bodega_slug,b.logo_url AS bodega_logo_url,b.region AS bodega_region,b.pais AS bodega_pais,b.denominacion_origen AS bodega_denominacion_origen`;
const WRITE_COLUMNS = ['nombre_comercial','precio','moneda','stock_disponible','disponible_venta','sku','tipo_vino','anada','pais','region','denominacion_origen','variedades_uva','crianza','meses_crianza','graduacion_alcoholica','volumen_ml','descripcion_corta','descripcion_completa','nota_cata','maridaje','temperatura_servicio','certificaciones','premios','produccion_limitada','peso_gramos','plazo_preparacion_dias','botellas_por_caja'] as const;

@Injectable()
export class VinosRepository {
  constructor(private readonly database:DatabaseService){}

  async bodegaPuedeOperar(bodegaId:string):Promise<boolean>{
    const rows=await this.database.query<{id:string}>("SELECT id FROM bodega WHERE id=$1 AND estado IN ('aprobada','activa')",[bodegaId]);
    return rows[0]!==undefined;
  }

  async crear(bodegaId:string,input:WineWriteRequestDto):Promise<WineRecord>{
    const values=this.values(input); const placeholders=values.map((_,index)=>`$${String(index+2)}`);
    const rows=await this.database.query<{id:string}>(`INSERT INTO vino (bodega_id,${WRITE_COLUMNS.join(',')},estado,stock_reservado,stock_minimo) VALUES ($1,${placeholders.join(',')},'borrador',0,0) RETURNING id`,[bodegaId,...values]);
    return this.required(await this.fetch(rows[0]?.id??'',bodegaId));
  }
  async listar(bodegaId:string,estado:WineState|undefined,page:number,pageSize:number):Promise<WinePage>{
    const where=estado===undefined?'v.bodega_id=$1':'v.bodega_id=$1 AND v.estado=$2'; const base=estado===undefined?[bodegaId]:[bodegaId,estado];
    const count=await this.database.query<{total:string}>(`SELECT count(*)::text AS total FROM vino v WHERE ${where}`,base);
    const rows=await this.database.query<Omit<WineRecord,'imagenes'>>(`SELECT ${WINE_COLUMNS} FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE ${where} ORDER BY v.updated_at DESC,v.id DESC LIMIT $${String(base.length+1)} OFFSET $${String(base.length+2)}`,[...base,pageSize,(page-1)*pageSize]);
    return{items:await this.withImages(rows),total:Number(count[0]?.total??0)};
  }
  async obtener(id:string,bodegaId:string):Promise<OwnedResult>{
    const wine=await this.fetch(id,bodegaId);if(wine!==null)return{kind:'found',wine};
    const exists=await this.database.query<{id:string}>('SELECT id FROM vino WHERE id=$1',[id]);return exists[0]===undefined?{kind:'missing'}:{kind:'foreign'};
  }
  async reemplazar(id:string,bodegaId:string,input:WineWriteRequestDto):Promise<OwnedResult>{
    const ownership=await this.obtener(id,bodegaId);if(ownership.kind!=='found')return ownership;
    const values=this.values(input);const set=WRITE_COLUMNS.map((column,index)=>`${column}=$${String(index+3)}`);
    await this.database.query(`UPDATE vino SET ${set.join(',')},updated_at=now() WHERE id=$1 AND bodega_id=$2`,[id,bodegaId,...values]);
    return{kind:'found',wine:this.required(await this.fetch(id,bodegaId))};
  }
  async solicitarPublicacion(id:string,bodegaId:string,usuarioId:string):Promise<PublicationResult>{
    return this.database.withTransaction(async client=>{
      const locked=await client.query<{estado:WineState;nombre_comercial:string;precio:string;moneda:string;stock_disponible:number;disponible_venta:boolean;bodega_estado:string}>(`SELECT v.estado,v.nombre_comercial,v.precio::text,v.moneda,v.stock_disponible,v.disponible_venta,b.estado AS bodega_estado FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE v.id=$1 AND v.bodega_id=$2 FOR UPDATE OF v`,[id,bodegaId]);
      const current=locked.rows[0];if(current===undefined)return{kind:'missing'};
      if(current.estado!=='borrador')return{kind:'conflict'};
      const images=await client.query('SELECT 1 FROM imagen WHERE tipo_entidad=\'vino\' AND entidad_id=$1 AND activa=true AND length(btrim(alt_text))>0 LIMIT 1',[id]);
      if(!['aprobada','activa'].includes(current.bodega_estado)||current.nombre_comercial.trim()===''||Number(current.precio)<=0||current.moneda!=='EUR'||current.stock_disponible<=0||!current.disponible_venta||images.rows[0]===undefined)return{kind:'invalid'};
      await client.query("UPDATE vino SET estado='pendiente_revision',updated_at=now() WHERE id=$1",[id]);
      await client.query(`INSERT INTO auditoria (usuario_id,tipo_entidad,entidad_id,accion,valor_anterior,valor_nuevo,descripcion,sistema,resultado) VALUES ($1,'vino',$2,'solicitar_publicacion',$3::jsonb,$4::jsonb,'Publicación de vino solicitada.','backend','correcto')`,[usuarioId,id,JSON.stringify({estado:current.estado}),JSON.stringify({estado:'pendiente_revision'})]);
      return{kind:'updated',wine:this.required(await this.fetchWithClient(client,id,bodegaId))};
    });
  }
  private values(input:WineWriteRequestDto):unknown[]{return WRITE_COLUMNS.map(column=>column==='produccion_limitada'?(input[column]??false):(input[column]??null));}
  private async fetch(id:string,bodegaId:string):Promise<WineRecord|null>{const rows=await this.database.query<Omit<WineRecord,'imagenes'>>(`SELECT ${WINE_COLUMNS} FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE v.id=$1 AND v.bodega_id=$2`,[id,bodegaId]);const result=await this.withImages(rows);return result[0]??null;}
  private async fetchWithClient(client:PoolClient,id:string,bodegaId:string):Promise<WineRecord|null>{const rows=await client.query<Omit<WineRecord,'imagenes'>>(`SELECT ${WINE_COLUMNS} FROM vino v JOIN bodega b ON b.id=v.bodega_id WHERE v.id=$1 AND v.bodega_id=$2`,[id,bodegaId]);const mapped=await this.withImagesClient(client,rows.rows);return mapped[0]??null;}
  private async withImages(rows:Omit<WineRecord,'imagenes'>[]):Promise<WineRecord[]>{if(rows.length===0)return[];const images=await this.database.query<ImageRecord&{entidad_id:string}>(`SELECT id,entidad_id,url,es_principal,orden,alt_text,resolucion FROM imagen WHERE tipo_entidad='vino' AND entidad_id=ANY($1::uuid[]) AND activa=true ORDER BY es_principal DESC,orden ASC,id ASC`,[rows.map(row=>row.id)]);return rows.map(row=>({...row,imagenes:images.filter(image=>image.entidad_id===row.id)}));}
  private async withImagesClient(client:PoolClient,rows:Omit<WineRecord,'imagenes'>[]):Promise<WineRecord[]>{if(rows.length===0)return[];const result=await client.query<ImageRecord&{entidad_id:string}>(`SELECT id,entidad_id,url,es_principal,orden,alt_text,resolucion FROM imagen WHERE tipo_entidad='vino' AND entidad_id=ANY($1::uuid[]) AND activa=true ORDER BY es_principal DESC,orden ASC,id ASC`,[rows.map(row=>row.id)]);return rows.map(row=>({...row,imagenes:result.rows.filter(image=>image.entidad_id===row.id)}));}
  private required(value:WineRecord|null):WineRecord{if(value===null)throw new Error('No se pudo recuperar el vino persistido.');return value;}
}
