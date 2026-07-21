import { createServer } from "node:http";

const wineId = "11111111-1111-4111-8111-111111111111";
const wineryId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const orderId = "55555555-5555-4555-8555-555555555555";
const token = "A".repeat(43);
let orderCanceled = false;

const wine = {
  id: wineId,
  nombre_comercial: "Reserva E2E",
  precio: "18.50",
  moneda: "EUR",
  disponible_venta: true,
  bodega: { id: wineryId, nombre_comercial: "Bodega Determinista" },
  tipo_vino: "Tinto",
  region: "Rioja",
  denominacion_origen: "DOCa Rioja",
};
const profile = {
  id: wineryId,
  nombre_comercial: "Bodega Determinista",
  estado: "activa",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-07-14T00:00:00Z",
  region: "Rioja",
  pais: "España",
  email_principal: "bodega@teralya.test",
  paises_envio: ["ES", "FR", "DE"],
  plazo_preparacion_dias: 2,
  plazo_entrega_estimado: "Entre 2 y 5 días laborables.",
  coste_envio_descripcion: "Calculado por destino antes de pagar.",
  transportista_habitual: "Transportista E2E",
  restricciones_entrega: "Entrega exclusiva a personas adultas.",
  condiciones_empaquetado: "Caja reforzada para botellas.",
  capacidad_internacional: true,
};
const publicWinery = {
  id: wineryId,
  nombre_comercial: "Bodega Determinista",
  region: "Rioja",
  pais: "España",
  denominacion_origen: "DOCa Rioja",
  anio_fundacion: 1985,
  historia: "Una familia dedicada al viñedo.",
  filosofia: "Origen, precisión y respeto por cada añada.",
  paises_envio: profile.paises_envio,
  plazo_preparacion_dias: profile.plazo_preparacion_dias,
  plazo_entrega_estimado: profile.plazo_entrega_estimado,
  coste_envio_descripcion: profile.coste_envio_descripcion,
  transportista_habitual: profile.transportista_habitual,
  restricciones_entrega: profile.restricciones_entrega,
  condiciones_empaquetado: profile.condiciones_empaquetado,
  capacidad_internacional: true,
  vinos: [wine],
};
const address = {
  nombre_destinatario: "Comprador E2E",
  direccion: "Calle del Viñedo 1",
  codigo_postal: "28001",
  ciudad: "Madrid",
  pais: "ES",
};

function orderSummary() {
  return {
    id: orderId,
    numero_pedido: "TER-E2E-0001",
    estado: orderCanceled ? "cancelado" : "pagado",
    total: "20.50",
    moneda: "EUR",
    created_at: "2026-07-17T09:00:00Z",
  };
}

function orderDetail() {
  return {
    ...orderSummary(),
    puede_cancelar: !orderCanceled,
    ...(orderCanceled
      ? {
          cancelacion: {
            estado: "completada",
            reembolso_estado: "succeeded",
            solicitada_at: "2026-07-17T09:05:00Z",
            completada_at: "2026-07-17T09:05:01Z",
          },
        }
      : {}),
    totales: {
      subtotal: "18.50",
      gastos_envio: "2.00",
      impuestos: "0.00",
      descuentos: "0.00",
      total: "20.50",
      moneda: "EUR",
    },
    direccion_envio_snapshot: address,
    direccion_facturacion_snapshot: address,
    lineas: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        vino_id: wineId,
        nombre_vino: wine.nombre_comercial,
        bodega: publicWinery.nombre_comercial,
        precio_unitario: "18.50",
        cantidad: 1,
        importe_total: "18.50",
      },
    ],
  };
}

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  if (request.method === "GET" && url.pathname === "/health")
    return send(response, 200, { status: "ok" });
  if (request.method === "GET" && url.pathname === "/vinos")
    return send(response, 200, {
      items: [wine],
      page: 1,
      page_size: 20,
      total_items: 1,
      total_pages: 1,
    });
  if (request.method === "GET" && url.pathname === `/vinos/${wineId}`)
    return send(response, 200, {
      ...wine,
      imagenes: [],
      pais: "España",
      descripcion_corta: "Un tinto de origen para compartir.",
      descripcion_completa: "Elaborado por Bodega Determinista en Rioja.",
      nota_cata: "Fruta roja, especias y final equilibrado.",
      maridaje: "Carnes asadas, quesos curados y cocina de temporada.",
      variedades_uva: ["Tempranillo"],
      volumen_ml: 750,
    });
  if (request.method === "GET" && url.pathname === `/bodegas/${wineryId}`)
    return send(response, 200, publicWinery);
  if (request.method === "POST" && url.pathname === "/auth/login") {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const input = JSON.parse(raw);
    const email = String(input.email);
    const role = email.startsWith("admin")
      ? "administrador"
      : email.startsWith("bodega")
        ? "bodega"
        : "comprador";
    return send(response, 200, {
      access_token: token,
      token_type: "Bearer",
      expires_in: 28800,
      expires_at: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
      usuario: {
        id: userId,
        email,
        rol: role,
        idioma: "es",
        estado: "activo",
        ...(role === "bodega" ? { bodega_id: wineryId } : {}),
      },
    });
  }
  if (request.headers.authorization === `Bearer ${token}`) {
    if (request.method === "GET" && url.pathname === "/admin/dashboard")
      return send(response, 200, {
        ventas_dia: { importe: "185.00", moneda: "EUR", num_pedidos: 10 },
        pedidos_pendientes: 3,
      });
    if (request.method === "GET" && url.pathname === "/pedidos")
      return send(response, 200, {
        items: [orderSummary()],
        page: 1,
        page_size: 20,
        total_items: 1,
        total_pages: 1,
      });
    if (request.method === "GET" && url.pathname === `/pedidos/${orderId}`)
      return send(response, 200, orderDetail());
    if (
      request.method === "POST" &&
      url.pathname === `/pedidos/${orderId}/cancelacion`
    ) {
      orderCanceled = true;
      return send(response, 200, {
        pedido_id: orderId,
        pedido_estado: "cancelado",
        pago_estado: "reembolsado",
        estado: "completada",
        reembolso_estado: "succeeded",
        solicitada_at: "2026-07-17T09:05:00Z",
        completada_at: "2026-07-17T09:05:01Z",
      });
    }
    if (request.method === "GET" && url.pathname === "/bodegas/yo/perfil")
      return send(response, 200, profile);
    if (request.method === "PATCH" && url.pathname === "/bodegas/yo/perfil")
      return send(response, 200, {
        ...profile,
        region: "Ribera del Duero",
        updated_at: new Date().toISOString(),
      });
  }
  return send(response, 404, {
    type: "https://teralya.es/problems/resource-not-found",
    title: "Resource Not Found",
    status: 404,
    detail: "Recurso no simulado.",
    code: "RESOURCE_NOT_FOUND",
    request_id: "44444444-4444-4444-8444-444444444444",
    retryable: false,
  });
});

server.listen(3001, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
