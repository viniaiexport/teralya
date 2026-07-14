import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';
import type { AddressDto } from './dto/address.dto.js';
import type { AddressCreateRequestDto, AddressPatchRequestDto, AddressUse } from './dto/address-request.dto.js';

export type Owner = { tipo: 'comprador' | 'bodega'; id: string; usuarioId: string };
export interface AddressRecord { id:string; propietario_tipo:Owner['tipo']; propietario_id:string; nombre_identificativo:string|null; destinatario:string; empresa:string|null; direccion:string; direccion_adicional:string|null; codigo_postal:string; ciudad:string; provincia:string|null; pais:string; persona_contacto:string|null; telefono:string|null; email:string|null; es_envio:boolean; es_facturacion:boolean; es_principal:boolean; activa:boolean; created_at:Date|string; updated_at:Date|string }
export type CreateResult = { kind:'created'; address:AddressRecord } | { kind:'replayed'; response:AddressDto } | { kind:'conflict' };
const COLUMNS='id, propietario_tipo, propietario_id, nombre_identificativo, destinatario, empresa, direccion, direccion_adicional, codigo_postal, ciudad, provincia, pais, persona_contacto, telefono, email, es_envio, es_facturacion, es_principal, activa, created_at, updated_at';

@Injectable()
export class DireccionesRepository {
  constructor(private readonly database: DatabaseService) {}
  async crear(owner:Owner,id:string,input:AddressCreateRequestDto,request:Record<string,unknown>):Promise<CreateResult>{
    return this.database.withTransaction(async client=>{
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',[id]);
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',[`${owner.tipo}:${owner.id}`]);
      const audits=await client.query<{valor_nuevo:unknown;identical:boolean}>(`SELECT valor_nuevo,(valor_nuevo->'request')=$3::jsonb AS identical FROM auditoria WHERE usuario_id=$1 AND tipo_entidad='direccion' AND entidad_id=$2 AND accion='crear_direccion' ORDER BY created_at ASC LIMIT 1`,[owner.usuarioId,id,JSON.stringify(request)]);
      const audit=audits.rows[0];
      if(audit!==undefined){ const saved=audit.valor_nuevo as {response?:AddressDto}; return audit.identical&&saved.response!==undefined?{kind:'replayed',response:saved.response}:{kind:'conflict'}; }
      const occupied=await client.query('SELECT 1 FROM direccion WHERE id=$1',[id]); if(occupied.rows[0]!==undefined)return {kind:'conflict'};
      if(input.es_principal===true && await this.hasPrincipal(client,owner))return {kind:'conflict'};
      const [esEnvio,esFacturacion]=this.flags(input.uso);
      const rows=await client.query<AddressRecord>(`INSERT INTO direccion (id,propietario_tipo,propietario_id,nombre_identificativo,destinatario,empresa,direccion,direccion_adicional,codigo_postal,ciudad,provincia,pais,persona_contacto,telefono,email,es_envio,es_facturacion,es_principal,activa) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,true) RETURNING ${COLUMNS}`,[id,owner.tipo,owner.id,input.nombre_identificativo??null,input.nombre_destinatario,input.empresa??null,input.direccion,input.direccion_adicional??null,input.codigo_postal,input.ciudad,input.provincia??null,input.pais,input.persona_contacto??null,input.telefono??null,input.email??null,esEnvio,esFacturacion,input.es_principal??false]);
      const address=rows.rows[0]; if(address===undefined)throw new Error('No se pudo crear la dirección.');
      const response=this.toDto(address);
      await client.query(`INSERT INTO auditoria (usuario_id,tipo_entidad,entidad_id,accion,valor_nuevo,descripcion,sistema,resultado) VALUES ($1,'direccion',$2,'crear_direccion',$3::jsonb,'Dirección creada.','backend','correcto')`,[owner.usuarioId,id,JSON.stringify({request,response})]);
      return {kind:'created',address};
    });
  }
  async listar(owner:Owner,uso?:AddressUse):Promise<AddressRecord[]>{const usage=uso===undefined?'':uso==='envio'?' AND es_envio=true':uso==='facturacion'?' AND es_facturacion=true':' AND es_envio=true AND es_facturacion=true';return this.database.query<AddressRecord>(`SELECT ${COLUMNS} FROM direccion WHERE propietario_tipo=$1 AND propietario_id=$2${usage} ORDER BY es_principal DESC,created_at ASC,id ASC`,[owner.tipo,owner.id]);}
  async actualizar(owner:Owner,id:string,input:AddressPatchRequestDto):Promise<AddressRecord|null|'inactive'|'principal_conflict'>{return this.database.withTransaction(async client=>{await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${owner.tipo}:${owner.id}`]);const found=await client.query<AddressRecord>(`SELECT ${COLUMNS} FROM direccion WHERE id=$1 AND propietario_tipo=$2 AND propietario_id=$3 FOR UPDATE`,[id,owner.tipo,owner.id]);const current=found.rows[0];if(current===undefined)return null;if(!current.activa)return'inactive';if(input.es_principal===true&&!current.es_principal&&await this.hasPrincipal(client,owner))return'principal_conflict';const mapped:Record<string,unknown>={};for(const [key,value] of Object.entries(input))mapped[key]=value;if(input.uso!==undefined){const [a,b]=this.flags(input.uso);mapped.es_envio=a;mapped.es_facturacion=b;delete mapped.uso;}if(input.nombre_destinatario!==undefined){mapped.destinatario=input.nombre_destinatario;delete mapped.nombre_destinatario;}const entries=Object.entries(mapped);const set=entries.map(([k],i)=>`${k}=$${String(i+4)}`);const rows=await client.query<AddressRecord>(`UPDATE direccion SET ${set.join(',')},updated_at=now() WHERE id=$1 AND propietario_tipo=$2 AND propietario_id=$3 RETURNING ${COLUMNS}`,[id,owner.tipo,owner.id,...entries.map(([,v])=>v)]);return rows.rows[0]??null;});}
  async desactivar(owner:Owner,id:string):Promise<boolean>{return this.database.withTransaction(async client=>{const rows=await client.query(`UPDATE direccion SET activa=false,es_principal=false,updated_at=CASE WHEN activa THEN now() ELSE updated_at END WHERE id=$1 AND propietario_tipo=$2 AND propietario_id=$3 RETURNING id`,[id,owner.tipo,owner.id]);return rows.rows[0]!==undefined;});}
  private flags(uso:AddressUse):[boolean,boolean]{return uso==='envio'?[true,false]:uso==='facturacion'?[false,true]:[true,true];}
  private async hasPrincipal(client:PoolClient,owner:Owner):Promise<boolean>{const rows=await client.query('SELECT 1 FROM direccion WHERE propietario_tipo=$1 AND propietario_id=$2 AND es_principal=true LIMIT 1',[owner.tipo,owner.id]);return rows.rows[0]!==undefined;}
  private toDto(r:AddressRecord):AddressDto{const optional=(key:keyof AddressRecord):Record<string,unknown>=>r[key]===null?{}:{[key]:r[key]};return{id:r.id,uso:r.es_envio&&r.es_facturacion?'ambos':r.es_envio?'envio':'facturacion',nombre_destinatario:r.destinatario,direccion:r.direccion,codigo_postal:r.codigo_postal,ciudad:r.ciudad,pais:r.pais,...optional('nombre_identificativo'),...optional('empresa'),...optional('direccion_adicional'),...optional('provincia'),...optional('persona_contacto'),...optional('telefono'),...optional('email'),es_principal:r.es_principal,activa:r.activa,created_at:new Date(r.created_at).toISOString(),updated_at:new Date(r.updated_at).toISOString()};}
}
