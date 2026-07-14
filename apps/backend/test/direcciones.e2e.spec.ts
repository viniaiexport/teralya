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
const payload=(suffix='')=>({uso:'envio',nombre_destinatario:`Destinatario${suffix}`,direccion:'Calle Mayor 1',codigo_postal:'28001',ciudad:'Madrid',pais:'España'});

describe('API-043–046 — direcciones E2E',()=>{
 let app:INestApplication;let pool:Pool;
 beforeAll(async()=>{pool=new Pool({connectionString:process.env.DATABASE_URL});const moduleRef=await Test.createTestingModule({imports:[AppModule]}).compile();app=moduleRef.createNestApplication();configureApplication(app as Parameters<typeof configureApplication>[0]);await app.init();});
 afterAll(async()=>{await app.close();await pool.end();});

 async function buyer():Promise<{usuarioId:string;token:string}>{const email=`direcciones-${randomUUID()}@teralya.test`;const user=await pool.query<{id:string}>(`INSERT INTO usuario(email,password_hash,nombre,apellidos,rol,estado) VALUES($1,$2,'API','Direcciones','comprador','activo') RETURNING id`,[email,HASH]);const usuarioId=user.rows[0]?.id;if(usuarioId===undefined)throw new Error('No se creó usuario fixture.');await pool.query(`INSERT INTO comprador(usuario_id,fecha_nacimiento,declaracion_mayoria_edad,declaracion_mayoria_edad_at,aceptacion_condiciones_alcohol,aceptacion_condiciones_alcohol_at,version_condiciones_alcohol) VALUES($1,'1990-01-01',true,now(),true,now(),'e2e')`,[usuarioId]);const token=(await app.get(SessionService).issue({usuarioId,rol:'comprador'})).accessToken;return{usuarioId,token};}
 const post=(token:string,key:string,body:Record<string,unknown>)=>request(app.getHttpServer() as Server).post('/direcciones').set('Authorization',`Bearer ${token}`).set('Idempotency-Key',key).send(body);

 it('crea 201 y persiste dirección y auditoría inmutable',async()=>{const fixture=await buyer();const id=randomUUID();const response=await post(fixture.token,id,payload()).expect(201);expect(response.body).toMatchObject({id,uso:'envio',activa:true});const rows=await pool.query<{audits:string;es_envio:boolean;es_facturacion:boolean}>(`SELECT d.es_envio,d.es_facturacion,count(a.id)::text AS audits FROM direccion d LEFT JOIN auditoria a ON a.entidad_id=d.id AND a.accion='crear_direccion' WHERE d.id=$1 GROUP BY d.id`,[id]);expect(rows.rows[0]).toEqual({es_envio:true,es_facturacion:false,audits:'1'});});

 it('reproduce 200 idéntico y rechaza reutilización distinta con 409',async()=>{const {token}=await buyer();const id=randomUUID();const first=await post(token,id,payload()).expect(201);const replay=await post(token,id,payload()).expect(200);expect(replay.body).toEqual(first.body);const conflict=await post(token,id,payload(' distinto')).expect(409);expect((conflict.body as Record<string,unknown>).code).toBe('CONFLICT');const audits=await pool.query(`SELECT id FROM auditoria WHERE entidad_id=$1 AND accion='crear_direccion'`,[id]);expect(audits.rowCount).toBe(1);});

 it('serializa dos altas idénticas con la misma key',async()=>{const {token}=await buyer();const id=randomUUID();const responses=await Promise.all([post(token,id,payload()),post(token,id,payload())]);expect(responses.map(r=>r.status).sort()).toEqual([200,201]);expect(responses[0].body).toEqual(responses[1].body);const rows=await pool.query('SELECT id FROM direccion WHERE id=$1',[id]);expect(rows.rowCount).toBe(1);});

 it('serializa dos principales con UUID distintos',async()=>{const {token}=await buyer();const body={...payload(),es_principal:true};const responses=await Promise.all([post(token,randomUUID(),body),post(token,randomUUID(),body)]);expect(responses.map(r=>r.status).sort()).toEqual([201,409]);});

 it('no permite observar ni mutar direcciones de otro propietario',async()=>{const owner=await buyer();const other=await buyer();const id=randomUUID();await post(owner.token,id,payload()).expect(201);await request(app.getHttpServer() as Server).patch(`/direcciones/${id}`).set('Authorization',`Bearer ${other.token}`).send({ciudad:'Bilbao'}).expect(404);const list=await request(app.getHttpServer() as Server).get('/direcciones').set('Authorization',`Bearer ${other.token}`).expect(200);expect(list.body).toEqual([]);});

 it('desactiva de forma idempotente con dos respuestas 204',async()=>{const {token}=await buyer();const id=randomUUID();await post(token,id,payload()).expect(201);const call=()=>request(app.getHttpServer() as Server).delete(`/direcciones/${id}`).set('Authorization',`Bearer ${token}`);await call().expect(204);await call().expect(204);const rows=await pool.query<{activa:boolean;es_principal:boolean}>('SELECT activa,es_principal FROM direccion WHERE id=$1',[id]);expect(rows.rows[0]).toEqual({activa:false,es_principal:false});});

 it('revierte la dirección si falla la auditoría de la misma transacción',async()=>{const fixture=await buyer();const id=randomUUID();await pool.query('DELETE FROM comprador WHERE usuario_id=$1',[fixture.usuarioId]);await pool.query('DELETE FROM usuario WHERE id=$1',[fixture.usuarioId]);await post(fixture.token,id,payload()).expect(500);const rows=await pool.query('SELECT id FROM direccion WHERE id=$1',[id]);expect(rows.rowCount).toBe(0);});
});
