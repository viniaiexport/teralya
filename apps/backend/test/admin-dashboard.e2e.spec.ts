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
function required<T>(value:T|undefined):T{if(value===undefined)throw new Error('Fixture ausente.');return value;}

describe('API-028 dashboard administrativo E2E',()=>{
  let app:INestApplication,pool:Pool,adminToken:string,buyerToken:string;
  beforeAll(async()=>{
    pool=new Pool({connectionString:process.env.DATABASE_URL});
    const moduleRef=await Test.createTestingModule({imports:[AppModule]}).compile();app=moduleRef.createNestApplication();configureApplication(app as Parameters<typeof configureApplication>[0]);await app.init();
    const user=async(role:'administrador'|'comprador')=>required((await pool.query<{id:string}>(`INSERT INTO usuario(email,password_hash,rol,estado) VALUES($1,$2,$3,'activo') RETURNING id`,[`dash-${role}-${randomUUID()}@test`,HASH,role])).rows[0]).id;
    const admin=await user('administrador'),buyer=await user('comprador');await pool.query(`INSERT INTO comprador(usuario_id,fecha_nacimiento,declaracion_mayoria_edad,aceptacion_condiciones_alcohol) VALUES($1,'1990-01-01',true,true)`,[buyer]);
    const address=required((await pool.query<{id:string}>(`INSERT INTO direccion(propietario_tipo,propietario_id,nombre_identificativo,destinatario,direccion,codigo_postal,ciudad,pais,es_envio,es_facturacion,activa) VALUES('comprador',$1,'Dashboard','Buyer','Calle 1','28001','Madrid','ES',true,true,true) RETURNING id`,[buyer])).rows[0]).id;
    const order=async(state:string,total:number)=>{const cart=required((await pool.query<{id:string}>(`INSERT INTO carrito(comprador_id,estado) VALUES($1,'convertido') RETURNING id`,[buyer])).rows[0]).id;return required((await pool.query<{id:string}>(`INSERT INTO pedido(numero_pedido,comprador_id,carrito_id,subtotal,gastos_envio,impuestos,descuentos,total,direccion_envio_id,direccion_envio_snapshot,direccion_facturacion_id,direccion_facturacion_snapshot,estado) VALUES($1,$2,$3,$4,0,0,0,$4,$5,'{}',$5,'{}',$6) RETURNING id`,[`TER-${randomUUID()}`,buyer,cart,total,address,state])).rows[0]).id;};
    const paidToday=await order('pagado',37.25),paidYesterday=await order('pagado',100),pending=await order('pendiente_pago',12);await order('cancelado',99);
    const payment=async(orderId:string,total:number,captured:string)=>pool.query(`INSERT INTO pago(pedido_id,subtotal,gastos_envio,impuestos,comision_marketplace,total_cobrado,total_repartido,total_reembolsado,moneda,estado,fecha_captura) VALUES($1,$2,0,0,0,$2,0,0,'EUR','pagado',$3)`,[orderId,total,captured]);
    await payment(paidToday,37.25,new Date().toISOString());await payment(paidYesterday,100,new Date(Date.now()-48*60*60*1000).toISOString());await pool.query(`INSERT INTO pago(pedido_id,subtotal,gastos_envio,impuestos,comision_marketplace,total_cobrado,total_repartido,total_reembolsado,moneda,estado) VALUES($1,12,0,0,0,12,0,0,'EUR','pendiente')`,[pending]);
    adminToken=(await app.get(SessionService).issue({usuarioId:admin,rol:'administrador'})).accessToken;buyerToken=(await app.get(SessionService).issue({usuarioId:buyer,rol:'comprador'})).accessToken;
  });
  afterAll(async()=>{await pool.end();await app.close();});
  it('agrega solo pagos capturados hoy y cuenta únicamente pendiente_pago',async()=>{const response=await request(app.getHttpServer() as Server).get('/admin/dashboard').set({Authorization:`Bearer ${adminToken}`}).expect(200);expect(response.body).toMatchObject({ventas_dia:{importe:'37.25',moneda:'EUR',num_pedidos:1}});expect((response.body as {pedidos_pendientes:number}).pedidos_pendientes).toBeGreaterThanOrEqual(1);expect(Object.keys(response.body as object).sort()).toEqual(['pedidos_pendientes','ventas_dia']);});
  it('protege el dashboard con rol administrador',async()=>{await request(app.getHttpServer() as Server).get('/admin/dashboard').expect(401);await request(app.getHttpServer() as Server).get('/admin/dashboard').set({Authorization:`Bearer ${buyerToken}`}).expect(403);});
});
