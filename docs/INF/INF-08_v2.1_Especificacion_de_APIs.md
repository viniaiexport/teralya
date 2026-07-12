# INF-08 – Especificación de APIs

**Teralya · Versión 2.1 · Julio 2026 · EN REVISIÓN**

*Corrección de auditoría de coherencia: API-012 pasa de "Visitante, Comprador" a "Comprador" — el carrito de visitante es exclusivamente local/cliente (ADR-001) y nunca invoca este endpoint.*

**Parámetros de entrada**
Ninguno

**Validaciones**
—

**Respuesta correcta**
200 OK. Carrito con sus líneas, cantidades y total recalculado.

**Posibles errores**
—

**Casos de uso relacionados**
CU-008

**Pantallas relacionadas**
PT-COM-002

**Observaciones**
—

---

### API-013 — Gestionar carrito — modificar cantidad

**Código**
API-013

**Nombre**
Gestionar carrito — modificar cantidad

**Objetivo**
Permitir que el comprador ajuste la cantidad de un vino en el carrito.

**Método HTTP**
PATCH

**Ruta**
`/carrito/items/{id}`

**Actor autorizado**
Comprador

**Parámetros de entrada**
cantidad

**Validaciones**
La línea pertenece al carrito del comprador. La cantidad no supera la disponibilidad.

**Respuesta correcta**
200 OK. Carrito actualizado.

**Posibles errores**
400 cantidad inválida · 409 stock insuficiente · 404 línea no encontrada.

**Casos de uso relacionados**
CU-008

**Pantallas relacionadas**
PT-COM-002

**Observaciones**
—

---

### API-014 — Gestionar carrito — eliminar producto

**Código**
API-014

**Nombre**
Gestionar carrito — eliminar producto

**Objetivo**
Permitir que el comprador elimine un vino del carrito.

**Método HTTP**
DELETE

**Ruta**
`/carrito/items/{id}`

**Actor autorizado**
Comprador

**Parámetros de entrada**
Ninguno

**Validaciones**
La línea pertenece al carrito del comprador.

**Respuesta correcta**
200 OK. Carrito actualizado (puede quedar vacío).

**Posibles errores**
404 línea no encontrada.

**Casos de uso relacionados**
CU-008

**Pantallas relacionadas**
PT-COM-002

**Observaciones**
—

---

### API-015 — Gestionar carrito — vaciar

**Código**
API-015

**Nombre**
Gestionar carrito — vaciar

**Objetivo**
Permitir que el comprador elimine todos los vinos del carrito.

**Método HTTP**
DELETE

**Ruta**
`/carrito`

**Actor autorizado**
Comprador

**Parámetros de entrada**
Ninguno

**Validaciones**
—

**Respuesta correcta**
200 OK. Carrito vacío.

**Posibles errores**
—

**Casos de uso relacionados**
CU-008

**Pantallas relacionadas**
PT-COM-002

**Observaciones**
—

---


## Módulo: Checkout

### API-016 — Realizar checkout

**Código**
API-016

**Nombre**
Realizar checkout

**Objetivo**
Confirmar los datos necesarios para preparar el Pedido antes del pago.

**Método HTTP**
POST

**Ruta**
`/checkout`

**Actor autorizado**
Comprador

**Parámetros de entrada**
direccion_envio_id, direccion_facturacion_id

**Validaciones**
Comprador autenticado. Carrito no vacío. Datos obligatorios completos. Dirección de envío válida. Disponibilidad revalidada. Un carrito activo solo puede originar un Pedido en estado `pendiente_pago`; si se repite la misma solicitud, se devuelve el Pedido ya creado sin generar otro.

**Respuesta correcta**
200 OK. Pedido preparado para pago, con total calculado.

**Posibles errores**
400 carrito vacío o datos incompletos · 404 dirección inválida · 409 disponibilidad cambiada.

**Casos de uso relacionados**
CU-009

**Pantallas relacionadas**
PT-COM-003

**Observaciones**
No se inicia el pago si el checkout no es válido. La operación es idempotente por carrito activo mientras exista su Pedido `pendiente_pago`.

---

### API-017 — Pagar Pedido

**Código**
API-017

**Nombre**
Pagar Pedido

**Objetivo**
Permitir que el comprador pague el Pedido preparado mediante Stripe Checkout.

**Método HTTP**
POST

**Ruta**
`/checkout/pago`

**Actor autorizado**
Comprador

**Parámetros de entrada**
pedido_id

**Validaciones**
El Pedido está preparado para pago. El importe es válido. Solo puede existir una sesión activa de Stripe Checkout por Pedido; un reintento reutiliza la sesión activa y no crea otra.

**Respuesta correcta**
200 OK. El sistema crea una sesión de Stripe Checkout y devuelve la URL de redirección.

**Posibles errores**
402 pago rechazado o cancelado en Stripe · 404 pedido no encontrado o no preparado · 500 error de conexión con Stripe.

**Casos de uso relacionados**
CU-010

**Pantallas relacionadas**
PT-COM-004

**Observaciones**
El Pedido solo se confirma cuando el sistema recibe la confirmación correcta de Stripe (ver Webhook de Stripe). La operación es idempotente por `pedido_id`: mientras exista una sesión válida, devuelve la misma URL de redirección.

---

### API-018 — Consultar confirmación de Pedido

**Código**
API-018

**Nombre**
Consultar confirmación de Pedido

**Objetivo**
Permitir que el comprador consulte la confirmación de su Pedido tras el retorno desde Stripe Checkout.

**Método HTTP**
GET

**Ruta**
`/checkout/confirmacion/{pedido_id}`

**Actor autorizado**
Comprador

**Parámetros de entrada**
pedido_id (en la ruta)

**Validaciones**
El Pedido pertenece al comprador autenticado.

**Respuesta correcta**
200 OK. Devuelve la confirmación del Pedido si el pago ya fue aprobado por el sistema.

**Posibles errores**
404 Pedido no encontrado o pago aún no confirmado.

**Casos de uso relacionados**
CU-010 / CU-028

**Pantallas relacionadas**
PT-COM-005

**Observaciones**
La confirmación solo se muestra como válida tras pago aprobado por Stripe.

---


## Módulo: Pedidos

### API-019 — Consultar Pedidos

**Código**
API-019

**Nombre**
Consultar Pedidos

**Objetivo**
Permitir que el comprador consulte sus Pedidos realizados.

**Método HTTP**
GET

**Ruta**
`/pedidos`

**Actor autorizado**
Comprador

**Parámetros de entrada**
Ninguno; paginación opcional

**Validaciones**
Solo se muestran Pedidos del comprador autenticado.

**Respuesta correcta**
200 OK. Listado de Pedidos propios.

**Posibles errores**
—

**Casos de uso relacionados**
CU-011

**Pantallas relacionadas**
PT-COM-006

**Observaciones**
El comprador consulta el Pedido completo, no los SubPedidos como unidad funcional.

---

### API-020 — Consultar detalle de Pedido

**Código**
API-020

**Nombre**
Consultar detalle de Pedido

**Objetivo**
Permitir que el comprador consulte el detalle completo de un Pedido propio.

**Método HTTP**
GET

**Ruta**
`/pedidos/{id}`

**Actor autorizado**
Comprador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El Pedido pertenece al comprador autenticado.

**Respuesta correcta**
200 OK. Detalle completo del Pedido y su estado global.

**Posibles errores**
403 acceso no autorizado · 404 Pedido no encontrado.

**Casos de uso relacionados**
CU-011

**Pantallas relacionadas**
PT-COM-007

**Observaciones**
El estado mostrado es el estado global del Pedido.

---


## Módulo: SubPedidos

### API-021 — Consultar SubPedidos de bodega

**Código**
API-021

**Nombre**
Consultar SubPedidos de bodega

**Objetivo**
Permitir que la bodega consulte los SubPedidos que debe preparar.

**Método HTTP**
GET

**Ruta**
`/bodegas/yo/subpedidos`

**Actor autorizado**
Bodega

**Parámetros de entrada**
Ninguno; paginación opcional

**Validaciones**
Bodega autenticada y validada. Solo se muestran SubPedidos asignados a esa bodega.

**Respuesta correcta**
200 OK. Listado de SubPedidos de la bodega.

**Posibles errores**
—

**Casos de uso relacionados**
CU-018

**Pantallas relacionadas**
PT-BOD-007

**Observaciones**
La bodega no accede al Pedido completo como unidad de gestión.

---

### API-022 — Consultar detalle de SubPedido

**Código**
API-022

**Nombre**
Consultar detalle de SubPedido

**Objetivo**
Permitir que la bodega consulte el detalle de un SubPedido asignado.

**Método HTTP**
GET

**Ruta**
`/bodegas/yo/subpedidos/{id}`

**Actor autorizado**
Bodega

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El SubPedido pertenece a la bodega.

**Respuesta correcta**
200 OK. Detalle del SubPedido, vinos incluidos y cantidades.

**Posibles errores**
403 el SubPedido no pertenece a la bodega · 404 no encontrado.

**Casos de uso relacionados**
CU-018

**Pantallas relacionadas**
PT-BOD-008

**Observaciones**
—

---

### API-023 — Cambiar estado de SubPedido

**Código**
API-023

**Nombre**
Cambiar estado de SubPedido

**Objetivo**
Permitir que la bodega actualice el estado operativo de un SubPedido asignado.

**Método HTTP**
PATCH

**Ruta**
`/bodegas/yo/subpedidos/{id}/estado`

**Actor autorizado**
Bodega

**Parámetros de entrada**
estado_destino

**Validaciones**
El SubPedido pertenece a la bodega. El cambio de estado está permitido para el estado actual.

**Respuesta correcta**
200 OK. Estado del SubPedido actualizado; el sistema recalcula automáticamente el estado global del Pedido cuando corresponde (CU-030).

**Posibles errores**
403 el SubPedido no pertenece a la bodega · 409 cambio de estado no permitido.

**Casos de uso relacionados**
CU-019

**Pantallas relacionadas**
PT-BOD-008

**Observaciones**
La bodega no puede modificar el Pedido completo.

---


## Módulo: Administración

### API-024 — Validar bodega

**Código**
API-024

**Nombre**
Validar bodega

**Objetivo**
Permitir que el administrador apruebe una bodega para operar en Teralya.

**Método HTTP**
POST

**Ruta**
`/admin/bodegas/{id}/validar`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
La bodega está pendiente de validación y tiene datos mínimos suficientes.

**Respuesta correcta**
200 OK. Bodega validada; puede acceder a su panel y operar.

**Posibles errores**
400 datos insuficientes · 404 bodega no encontrada · 409 bodega ya validada.

**Casos de uso relacionados**
CU-021

**Pantallas relacionadas**
PT-ADM-002 / PT-ADM-003

**Observaciones**
—

---

### API-025 — Publicar vino

**Código**
API-025

**Nombre**
Publicar vino

**Objetivo**
Permitir que el administrador haga visible un vino en el marketplace.

**Método HTTP**
POST

**Ruta**
`/admin/vinos/{id}/publicar`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino existe, tiene información mínima completa y la bodega propietaria está validada.

**Respuesta correcta**
200 OK. Vino publicado; visible en catálogo, búsqueda y ficha pública.

**Posibles errores**
400 vino incompleto · 400 bodega no validada · 404 vino no encontrado.

**Casos de uso relacionados**
CU-023

**Pantallas relacionadas**
PT-ADM-004 / PT-ADM-005

**Observaciones**
Solo el administrador puede publicar vinos; la bodega únicamente puede solicitarlo (CU-017).

---

### API-026 — Despublicar vino

**Código**
API-026

**Nombre**
Despublicar vino

**Objetivo**
Permitir que el administrador retire un vino de la visibilidad pública.

**Método HTTP**
POST

**Ruta**
`/admin/vinos/{id}/despublicar`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino existe.

**Respuesta correcta**
200 OK. Vino despublicado; deja de aparecer en catálogo y búsqueda.

**Posibles errores**
404 vino no encontrado · 409 vino ya despublicado.

**Casos de uso relacionados**
CU-024

**Pantallas relacionadas**
PT-ADM-004 / PT-ADM-005

**Observaciones**
No elimina el histórico de Pedidos existentes.

---

### API-027 — Consultar Pedidos como administrador

**Código**
API-027

**Nombre**
Consultar Pedidos como administrador

**Objetivo**
Permitir que el administrador supervise los Pedidos generados en Teralya.

**Método HTTP**
GET

**Ruta**
`/admin/pedidos`

**Actor autorizado**
Administrador

**Parámetros de entrada**
Ninguno; paginación opcional

**Validaciones**
Administrador autenticado con permisos activos.

**Respuesta correcta**
200 OK. Listado de Pedidos con acceso a su detalle completo.

**Posibles errores**
—

**Casos de uso relacionados**
CU-025

**Pantallas relacionadas**
PT-ADM-006 / PT-ADM-007

**Observaciones**
Los SubPedidos se muestran como información operativa interna, no como módulo independiente.

---

### API-028 — Consultar dashboard administrativo

**Código**
API-028

**Nombre**
Consultar dashboard administrativo

**Objetivo**
Permitir que el administrador consulte los indicadores mínimos del MVP.

**Método HTTP**
GET

**Ruta**
`/admin/dashboard`

**Actor autorizado**
Administrador

**Parámetros de entrada**
Ninguno

**Validaciones**
Administrador autenticado con permisos activos.

**Respuesta correcta**
200 OK. Devuelve exclusivamente ventas del día y pedidos pendientes.

**Posibles errores**
401 no autenticado · 403 sin permisos.

**Casos de uso relacionados**
CU-026

**Pantallas relacionadas**
PT-ADM-001

**Observaciones**
El dashboard del MVP se limita a estos dos indicadores; no se añaden métricas adicionales.

---


## Módulo: Sistema

### API-029 — Webhook de Stripe

**Código**
API-029

**Nombre**
Webhook de Stripe

**Objetivo**
Recibir la confirmación de Stripe y confirmar el Pedido, generando los SubPedidos internos correspondientes.

**Método HTTP**
POST

**Ruta**
`/sistema/webhooks/stripe`

**Actor autorizado**
Sistema (Stripe, autenticado por firma de webhook)

**Parámetros de entrada**
Payload de evento de Stripe

**Validaciones**
La firma del webhook se verifica antes de procesar el evento. El Pedido solo se confirma si el pago está aprobado. El procesamiento es idempotente.

**Respuesta correcta**
200 OK. Confirmación de recepción a Stripe; el Pedido queda confirmado y los SubPedidos generados si el pago es correcto.

**Posibles errores**
400 firma inválida · 422 evento no reconocido · pago rechazado o cancelado: el Pedido no se confirma.

**Casos de uso relacionados**
CU-028 / CU-029

**Pantallas relacionadas**
—

**Observaciones**
Es la fuente definitiva de verdad sobre el estado del pago; genera un SubPedido por cada bodega incluida en el Pedido.

---


*INF-08 v2.1 — 29 endpoints en 9 módulos. Cambio limitado: protección de idempotencia en API-016 y API-017. Estado: EN REVISIÓN.*