import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/bootstrap.js';
import { SessionService } from '../src/common/security/session.service.js';

const HASH='scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const BODY={nombre_comercial:'Reserva API vinos',precio:'18.50',moneda:'EUR',stock_disponible:12,disponible_venta:true,sku:'SKU-OWN-1',variedades_uva:['Tempranillo']};
function required<T>(value:T|undefined):T{if(value===undefined)throw new Error('Fixture no creada.');return value;}

describe('APIs 007/008/032/033/034 — integración vinos propios',()=>{
  let app:INestApplication;let pool:Pool;let bodegaId:string;let userId:string;let token:string;let foreignToken:string;
  beforeAll(async()=>{
    pool=new Pool({connectionString:process.env.DATABASE_URL});const moduleRef=await Test.createTestingModule({imports:[AppModule]}).compile();app=moduleRef.createNestApplication();configureApplication(app as Parameters<typeof configureApplication>[0]);await app.init();
    const make=async(label:string)=>{const b=await pool.query<{id:string}>(`INSERT INTO bodega (nombre_comercial,razon_social,cif_vat,estado,tipo,email_principal,telefono,persona_contacto) VALUES ($1,$2,$3,'aprobada','estandar',$4,$5,$6) RETURNING id`,[`Bodega ${label}`,`Bodega ${label} SL`,`ESB${randomUUID().replaceAll('-','').slice(0,8)}`,`${label}-${randomUUID()}@teralya.test`,'+34910000000','Responsable']);const id=required(b.rows[0]).id;const u=await pool.query<{id:string}>(`INSERT INTO usuario (email,password_hash,rol,estado,bodega_id) VALUES ($1,$2,'bodega','activo',$3) RETURNING id`,[`${label}-u-${randomUUID()}@teralya.test`,HASH,id]);return{id,userId:required(u.rows[0]).id};};
    const own=await make('own');bodegaId=own.id;userId=own.userId;const foreign=await make('foreign');const sessions=app.get(SessionService);token=(await sessions.issue({usuarioId:userId,rol:'bodega',bodegaId})).accessToken;foreignToken=(await sessions.issue({usuarioId:foreign.userId,rol:'bodega',bodegaId:foreign.id})).accessToken;
  });
  afterAll(async()=>{await pool.end();await app.close();});
  const auth=(value=token)=>({Authorization:`Bearer ${value}`});
  async function create(){return request(app.getHttpServer() as Server).post('/bodegas/yo/vinos').set(auth()).send(BODY).expect(201);}
  async function createId():Promise<string>{const response=await create();return(response.body as {id:string}).id;}

  it('crea, pagina, consulta y reemplaza con PUT completo',async()=>{const created=await create();expect(created.body).toMatchObject({...BODY,estado:'borrador',stock_reservado:0,stock_minimo:0,imagenes:[]});const id=(created.body as {id:string}).id;const list=await request(app.getHttpServer() as Server).get('/bodegas/yo/vinos?estado=borrador&page=1&page_size=1').set(auth()).expect(200);expect(list.body).toMatchObject({page:1,page_size:1});expect((list.body as {items:{id:string}[]}).items[0]?.id).toBe(id);await request(app.getHttpServer() as Server).get(`/bodegas/yo/vinos/${id}`).set(auth()).expect(200);const replaced=await request(app.getHttpServer() as Server).put(`/bodegas/yo/vinos/${id}`).set(auth()).send({...BODY,nombre_comercial:'Reemplazado',sku:undefined,variedades_uva:undefined}).expect(200);expect(replaced.body).toMatchObject({nombre_comercial:'Reemplazado',estado:'borrador'});expect(replaced.body).not.toHaveProperty('sku');});
  it('aplica 403 al acceso ajeno en 008/033 y 404 opaco en 034',async()=>{const id=await createId();await request(app.getHttpServer() as Server).get(`/bodegas/yo/vinos/${id}`).set(auth(foreignToken)).expect(403);await request(app.getHttpServer() as Server).put(`/bodegas/yo/vinos/${id}`).set(auth(foreignToken)).send(BODY).expect(403);await request(app.getHttpServer() as Server).post(`/bodegas/yo/vinos/${id}/solicitar-publicacion`).set(auth(foreignToken)).expect(404);});
  it('valida precondiciones y serializa publicación concurrente con una sola auditoría',async()=>{const id=await createId();await request(app.getHttpServer() as Server).post(`/bodegas/yo/vinos/${id}/solicitar-publicacion`).set(auth()).expect(400);await pool.query(`INSERT INTO imagen (tipo_entidad,entidad_id,nombre_archivo,url,formato,tamanio_bytes,resolucion,es_principal,orden,alt_text,activa,subido_por) VALUES ('vino',$1,$2,$3,'webp',1000,'1200x1600',true,0,$4,true,$5)`,[id,'reserva.webp',`https://cdn.teralya.test/${id}.webp`,'Botella Reserva',userId]);const call=()=>request(app.getHttpServer() as Server).post(`/bodegas/yo/vinos/${id}/solicitar-publicacion`).set(auth());const responses=await Promise.all([call(),call()]);expect(responses.map(response=>response.status).sort()).toEqual([200,409]);const persisted=await pool.query<{estado:string;audits:string}>(`SELECT v.estado,count(a.id)::text AS audits FROM vino v LEFT JOIN auditoria a ON a.entidad_id=v.id AND a.accion='solicitar_publicacion' WHERE v.id=$1 GROUP BY v.id`,[id]);expect(persisted.rows[0]).toEqual({estado:'pendiente_revision',audits:'1'});});
});
