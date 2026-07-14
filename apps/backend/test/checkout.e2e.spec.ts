import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApplication } from "../src/bootstrap.js";
import { SessionService } from "../src/common/security/session.service.js";
import {
  STRIPE_GATEWAY,
  type StripeGateway,
  type StripeSessionInput,
} from "../src/modules/checkout/stripe.gateway.js";
const HASH =
  "scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
function req<T>(v: T | undefined): T {
  if (v === undefined) throw new Error("fixture");
  return v;
}
class FakeStripe implements StripeGateway {
  calls = 0;
  readonly sessions = new Map<
    string,
    { id: string; url: string; expiresAt: number }
  >();
  createCheckoutSession(
    input: StripeSessionInput,
  ): Promise<{ id: string; url: string; expiresAt: number }> {
    this.calls += 1;
    const id = `cs_test_${String(this.calls)}`;
    const session = {
      id,
      url: `https://checkout.test/${id}`,
      expiresAt: input.expiresAt,
    };
    this.sessions.set(id, session);
    return Promise.resolve(session);
  }
  retrieveCheckoutSession(
    id: string,
  ): Promise<{ id: string; url: string; expiresAt: number }> {
    const session = this.sessions.get(id);
    return session === undefined
      ? Promise.reject(new Error("missing"))
      : Promise.resolve(session);
  }
}
describe("API016 checkout E2E", () => {
  let app: INestApplication;
  let pool: Pool;
  let buyer: string;
  let token: string;
  let cart: string;
  let wine: string;
  let shipping: string;
  let billing: string;
  let alternate: string;
  let foreign: string;
  let orderId: string;
  const stripe = new FakeStripe();
  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const m = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STRIPE_GATEWAY)
      .useValue(stripe)
      .compile();
    app = m.createNestApplication();
    configureApplication(app as Parameters<typeof configureApplication>[0]);
    await app.init();
    const u = await pool.query<{ id: string }>(
      `INSERT INTO usuario(email,password_hash,rol,estado) VALUES($1,$2,'comprador','activo') RETURNING id`,
      [`checkout-${randomUUID()}@test`, HASH],
    );
    buyer = req(u.rows[0]).id;
    await pool.query(
      `INSERT INTO comprador(usuario_id,fecha_nacimiento,declaracion_mayoria_edad,aceptacion_condiciones_alcohol) VALUES($1,'1990-01-01',true,true)`,
      [buyer],
    );
    const b = await pool.query<{ id: string }>(
      `INSERT INTO bodega(nombre_comercial,estado,tipo,comision) VALUES('Checkout Bodega','aprobada','estandar',10) RETURNING id`,
    );
    const v = await pool.query<{ id: string }>(
      `INSERT INTO vino(bodega_id,nombre_comercial,precio,moneda,stock_disponible,disponible_venta,estado,fecha_publicacion) VALUES($1,'Checkout Wine',10,'EUR',20,true,'publicado',now()) RETURNING id`,
      [req(b.rows[0]).id],
    );
    wine = req(v.rows[0]).id;
    const c = await pool.query<{ id: string }>(
      `INSERT INTO carrito(comprador_id,num_productos,num_botellas,subtotal,gastos_envio,descuentos,total) VALUES($1,1,2,20,3,1,22) RETURNING id`,
      [buyer],
    );
    cart = req(c.rows[0]).id;
    await pool.query(
      `INSERT INTO carrito_item(carrito_id,vino_id,cantidad,precio_unitario,importe_total) VALUES($1,$2,2,10,20)`,
      [cart, wine],
    );
    const address = async (label: string, send: boolean, bill: boolean) =>
      req(
        (
          await pool.query<{ id: string }>(
            `INSERT INTO direccion(propietario_tipo,propietario_id,destinatario,direccion,codigo_postal,ciudad,pais,es_envio,es_facturacion) VALUES('comprador',$1,$2,$3,'28001','Madrid','ES',$4,$5) RETURNING id`,
            [buyer, label, `Calle ${label}`, send, bill],
          )
        ).rows[0],
      ).id;
    shipping = await address("Envío", true, false);
    billing = await address("Factura", false, true);
    alternate = await address("Otra", true, true);
    foreign = req(
      (
        await pool.query<{ id: string }>(
          `INSERT INTO direccion(propietario_tipo,propietario_id,destinatario,direccion,codigo_postal,ciudad,pais,es_envio,es_facturacion) VALUES('bodega',$1,'Ajena','Calle Ajena','28001','Madrid','ES',true,true) RETURNING id`,
          [req(b.rows[0]).id],
        )
      ).rows[0],
    ).id;
    token = (
      await app
        .get(SessionService)
        .issue({ usuarioId: buyer, rol: "comprador" })
    ).accessToken;
  });
  afterAll(async () => {
    await pool.end();
    await app.close();
  });
  const auth = () => ({ Authorization: `Bearer ${token}` });
  it("clasifica carrito vacío, uso incorrecto, inactiva y ajena", async () => {
    await pool.query("DELETE FROM carrito_item WHERE carrito_id=$1", [cart]);
    await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({ direccion_envio_id: shipping, direccion_facturacion_id: billing })
      .expect(400);
    await pool.query(
      "INSERT INTO carrito_item(carrito_id,vino_id,cantidad,precio_unitario,importe_total) VALUES($1,$2,2,10,20)",
      [cart, wine],
    );
    await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({ direccion_envio_id: billing, direccion_facturacion_id: billing })
      .expect(400);
    await pool.query("UPDATE direccion SET activa=false WHERE id=$1", [
      alternate,
    ]);
    await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({
        direccion_envio_id: alternate,
        direccion_facturacion_id: billing,
      })
      .expect(404);
    await pool.query("UPDATE direccion SET activa=true WHERE id=$1", [
      alternate,
    ]);
    await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({ direccion_envio_id: foreign, direccion_facturacion_id: billing })
      .expect(403);
  });
  it("crea exactamente un Pedido y Pago atómicos bajo concurrencia", async () => {
    const body = {
      direccion_envio_id: shipping,
      direccion_facturacion_id: billing,
    };
    const call = () =>
      request(app.getHttpServer() as Server)
        .post("/checkout")
        .set(auth())
        .send(body);
    const responses = await Promise.all([call(), call()]);
    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(responses[0].body).toEqual(responses[1].body);
    expect(responses[0].body).toMatchObject({
      estado: "pendiente_pago",
      totales: {
        subtotal: "20.00",
        gastos_envio: "3.00",
        impuestos: "0.00",
        descuentos: "1.00",
        total: "22.00",
        moneda: "EUR",
      },
      direccion_envio_snapshot: { nombre_destinatario: "Envío" },
    });
    orderId = (responses[0].body as { id: string }).id;
    const persisted = await pool.query<{
      orders: string;
      payments: string;
      audits: string;
    }>(
      `SELECT count(DISTINCT p.id)::text orders,count(DISTINCT pg.id)::text payments,count(DISTINCT a.id)::text audits FROM pedido p LEFT JOIN pago pg ON pg.pedido_id=p.id LEFT JOIN auditoria a ON a.entidad_id=p.id AND a.accion='preparar_checkout' WHERE p.carrito_id=$1`,
      [cart],
    );
    expect(persisted.rows[0]).toEqual({
      orders: "1",
      payments: "1",
      audits: "1",
    });
  });
  it("crea una sola sesión Stripe y reutiliza la vigente bajo concurrencia", async () => {
    const call = () =>
      request(app.getHttpServer() as Server)
        .post("/checkout/pago")
        .set(auth())
        .send({ pedido_id: orderId });
    const responses = await Promise.all([call(), call()]);
    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    const [firstBody, secondBody] = responses.map(
      (response) => response.body as Record<string, unknown>,
    );
    const { reused: firstReused, ...first } = firstBody;
    const { reused: secondReused, ...second } = secondBody;
    expect(first).toEqual(second);
    expect([firstReused, secondReused].sort()).toEqual([false, true]);
    expect(responses[0].body).toMatchObject({
      pedido_id: orderId,
      checkout_url: "https://checkout.test/cs_test_1",
    });
    expect(stripe.calls).toBe(1);
  });
  it("replay ignora cambios del body y devuelve snapshots originales", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({
        direccion_envio_id: alternate,
        direccion_facturacion_id: alternate,
      })
      .expect(200);
    expect(response.body).toMatchObject({
      direccion_envio_snapshot: { nombre_destinatario: "Envío" },
      direccion_facturacion_snapshot: { nombre_destinatario: "Factura" },
    });
  });
  it("rechaza como conflicto el pedido previo que ya no está pendiente", async () => {
    await pool.query(
      "UPDATE pedido SET estado='cancelado' WHERE carrito_id=$1",
      [cart],
    );
    await request(app.getHttpServer() as Server)
      .post("/checkout")
      .set(auth())
      .send({ direccion_envio_id: shipping, direccion_facturacion_id: billing })
      .expect(409);
  });
});
