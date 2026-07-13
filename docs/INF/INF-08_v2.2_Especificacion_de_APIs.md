# INF-08 – Especificación de APIs

**Teralya · Versión 2.2 · Julio 2026 · EN REVISIÓN**

*INF-08 v2.2: incorpora contratos explícitos para las 13 operaciones señaladas en la Auditoría de cobertura de Pantallas y CU v1.0 (huecos entre CAP-05/CAP-06/CAP-07 e INF-08 v2.1). Conserva los 29 endpoints válidos de v2.1 sin alterar su contrato; solo añade endpoints nuevos y confirma el flujo de credenciales de registro de bodega (ADR-002). No modifica INF-07, INF-09, ADR-003 ni ADR-004.*
Especificación funcional de las APIs del MVP, derivada directamente de los Casos de Uso de CAP-06 y las Pantallas de CAP-05. Documento puramente funcional: no incluye código, no diseña la implementación, no especifica TypeScript ni SQL, no diseña autenticación JWT ni Supabase. 42 endpoints en 9 módulos — cada uno corresponde a un Caso de Uso o pantalla aprobados (CAP-05/CAP-06/CAP-07); no se ha añadido funcionalidad más allá del MVP.

## Índice de módulos

1. Autenticación (4) · 2. Bodegas (4) · 3. Vinos (7) · 4. Carrito (5) · 5. Checkout (3) · 6. Pedidos (2) · 7. SubPedidos (3) · 8. Administración (13) · 9. Sistema (1)

---

## Módulo: Autenticación

### API-001 — Registro de comprador

**Código**
API-001


**Nombre**
Registro de comprador

**Objetivo**
Crear una cuenta nueva de comprador, incluyendo la verificación de mayoría de edad exigida por CU-001.

**Método HTTP**
POST

**Ruta**
`/auth/registro/comprador`

**Actor autorizado**
Público

**Parámetros de entrada**
email, password, nombre, apellidos, fecha_nacimiento, declaracion_mayoria_edad (booleano), aceptacion_condiciones_alcohol (booleano), idioma (opcional, detectado del navegador cuando sea posible)

**Validaciones**
Email con formato válido y no registrado previamente. Password con longitud y complejidad mínimas. fecha_nacimiento obligatoria; edad calculada debe cumplir la edad mínima configurada. declaracion_mayoria_edad y aceptacion_condiciones_alcohol deben ser explícitamente verdaderas.

**Respuesta correcta**
201 Created. Devuelve el usuario creado y token de sesión.

**Posibles errores**
400 datos inválidos · 400 edad insuficiente · 409 email ya registrado.

**Casos de uso relacionados**
CU-001

**Pantallas relacionadas**
PT-ACC-001

**Observaciones**
Registra en auditoría la aceptación y su fecha. Sin verificación documental de identidad en el MVP.

---
### API-002 — Iniciar sesión

**Código**
API-002


**Nombre**
Iniciar sesión

**Objetivo**
Permitir que comprador, bodega o administrador accedan a su área correspondiente.

**Método HTTP**
POST

**Ruta**
`/auth/login`

**Actor autorizado**
Público

**Parámetros de entrada**
email, password

**Validaciones**
Email y password obligatorios. Credenciales correctas. Usuario activo. Bodega debe estar validada para acceso operativo.

**Respuesta correcta**
200 OK. Devuelve el usuario autenticado y token de sesión; redirige según rol.

**Posibles errores**
401 credenciales incorrectas · 403 cuenta no activa · 403 bodega no validada.

**Casos de uso relacionados**
CU-002

**Pantallas relacionadas**
PT-ACC-003

**Observaciones**
—

---
### API-003 — Recuperar contraseña — solicitar

**Código**
API-003


**Nombre**
Recuperar contraseña — solicitar

**Objetivo**
Permitir que un usuario solicite instrucciones para recuperar el acceso a su cuenta.

**Método HTTP**
POST

**Ruta**
`/auth/recuperar-password`

**Actor autorizado**
Público

**Parámetros de entrada**
email

**Validaciones**
Email obligatorio y con formato válido. La existencia de la cuenta no se valida como condición para responder — se comprueba internamente solo para decidir si se genera la solicitud de recuperación.

**Respuesta correcta**
200 OK. Respuesta genérica de confirmación de envío, idéntica exista o no una cuenta asociada a ese email.

**Posibles errores**
400 email con formato inválido.

**Casos de uso relacionados**
CU-003

**Pantallas relacionadas**
PT-ACC-004

**Observaciones**
Solo se genera y envía una solicitud de recuperación (`solicitud_recuperacion_password`) cuando la cuenta existe internamente; de cara al solicitante, la respuesta es siempre 200 OK genérico, para no revelar si un email está registrado (regla de recuperación segura de CAP-02). El enlace o token generado tiene validez limitada.

---
### API-004 — Recuperar contraseña — establecer nueva

**Código**
API-004


**Nombre**
Recuperar contraseña — establecer nueva

**Objetivo**
Permitir que el usuario defina una nueva contraseña tras iniciar la recuperación.

**Método HTTP**
POST

**Ruta**
`/auth/restablecer-password`

**Actor autorizado**
Público

**Parámetros de entrada**
token, password_nueva, confirmacion_password

**Validaciones**
Token válido y no expirado. password_nueva cumple reglas mínimas. La confirmación debe coincidir. El token no se reutiliza una vez completado.

**Respuesta correcta**
200 OK. Contraseña actualizada.

**Posibles errores**
400 token inválido o expirado · 400 contraseña no válida o no coincide.

**Casos de uso relacionados**
CU-003

**Pantallas relacionadas**
PT-ACC-005

**Observaciones**
—

---

## Módulo: Bodegas

### API-005 — Solicitar registro como bodega

**Código**
API-005


**Nombre**
Solicitar registro como bodega

**Objetivo**
Permitir que una bodega solicite acceso a Teralya como bodega fundadora.

**Método HTTP**
POST

**Ruta**
`/bodegas`

**Actor autorizado**
Bodega no registrada

**Parámetros de entrada**
nombre_comercial, email, password, datos de contacto, datos mínimos de identificación

**Validaciones**
Email único. Campos obligatorios completos. Datos mínimos de identificación aportados. Condiciones obligatorias aceptadas. Password cumple la política mínima de complejidad.

**Respuesta correcta**
201 Created. Solicitud registrada como pendiente de validación administrativa.

**Posibles errores**
400 datos incompletos · 400 condiciones no aceptadas · 409 email ya registrado.

**Casos de uso relacionados**
CU-012

**Pantallas relacionadas**
PT-ACC-002

**Observaciones**
La bodega no puede operar hasta ser validada por administración. El registro crea directamente la cuenta de usuario (`usuario.password_hash`) asociada a la bodega, conforme al modelo de autenticación autogestionado de ADR-002 — no existe un segundo flujo de identidad ni credenciales separadas.

---
### API-006 — Completar perfil de bodega

**Código**
API-006


**Nombre**
Completar perfil de bodega

**Objetivo**
Permitir que la bodega complete o actualice la información visible para compradores.

**Método HTTP**
PATCH

**Ruta**
`/bodegas/yo/perfil`

**Actor autorizado**
Bodega

**Parámetros de entrada**
descripción comercial, localización general, información visible para compradores

**Validaciones**
Bodega autenticada y validada. Campos obligatorios completos. Formatos válidos. La bodega solo edita su propio perfil.

**Respuesta correcta**
200 OK. Perfil actualizado.

**Posibles errores**
400 campos obligatorios incompletos o formato inválido · 401 no autenticado · 403 no autorizado.

**Casos de uso relacionados**
CU-014

**Pantallas relacionadas**
PT-BOD-002

**Observaciones**
—

---
### API-007 — Consultar ficha pública de bodega

**Código**
API-007


**Nombre**
Consultar ficha pública de bodega

**Objetivo**
Permitir que cualquier visitante consulte el perfil público de una bodega validada y su catálogo publicado.

**Método HTTP**
GET

**Ruta**
`/bodegas/{id}`

**Actor autorizado**
Visitante, Comprador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
La bodega debe existir y estar validada.

**Respuesta correcta**
200 OK. Perfil público de la bodega y sus vinos publicados.

**Posibles errores**
404 bodega no encontrada o no validada.

**Casos de uso relacionados**
CU-006 (navegación alternativa)

**Pantallas relacionadas**
PT-PUB-004

**Observaciones**
Complementa la ficha de vino cuando el comprador navega desde el vino hacia la bodega. Brecha 1 de la Auditoría de cobertura v1.0.

---

### API-008 — Consultar perfil propio de bodega

**Código**
API-008


**Nombre**
Consultar perfil propio de bodega

**Objetivo**
Permitir que la bodega autenticada consulte los datos de su propio perfil antes de editarlo.

**Método HTTP**
GET

**Ruta**
`/bodegas/yo/perfil`

**Actor autorizado**
Bodega

**Parámetros de entrada**
Ninguno

**Validaciones**
Bodega autenticada.

**Respuesta correcta**
200 OK. Datos completos del perfil propio.

**Posibles errores**
401 no autenticado.

**Casos de uso relacionados**
CU-014

**Pantallas relacionadas**
PT-BOD-002

**Observaciones**
Complementa a Completar perfil de bodega, que ya existía sin lectura explícita. Brecha 2 de la Auditoría de cobertura v1.0.

---


## Módulo: Vinos

### API-009 — Crear vino

**Código**
API-009


**Nombre**
Crear vino

**Objetivo**
Permitir que una bodega cree un vino para revisión y futura publicación.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos`

**Actor autorizado**
Bodega

**Parámetros de entrada**
información mínima del vino, precio, disponibilidad

**Validaciones**
Bodega autenticada y validada. Precio y disponibilidad válidos. El vino se guarda sin publicar.

**Respuesta correcta**
201 Created. Vino creado como no publicado / pendiente de revisión.

**Posibles errores**
400 información obligatoria incompleta · 400 precio o disponibilidad inválidos.

**Casos de uso relacionados**
CU-015

**Pantallas relacionadas**
PT-BOD-004

**Observaciones**
El vino no queda visible para compradores hasta ser publicado por administración.

---
### API-010 — Editar vino propio

**Código**
API-010


**Nombre**
Editar vino propio

**Objetivo**
Permitir que una bodega actualice la información de un vino propio.

**Método HTTP**
PUT

**Ruta**
`/bodegas/yo/vinos/{id}`

**Actor autorizado**
Bodega

**Parámetros de entrada**
campos editables del vino

**Validaciones**
Bodega autenticada y validada. El vino pertenece a la bodega. Precio y disponibilidad válidos si se modifican. No se puede publicar un vino incompleto.

**Respuesta correcta**
200 OK. Vino actualizado.

**Posibles errores**
400 datos inválidos · 403 el vino no pertenece a la bodega · 404 vino no encontrado.

**Casos de uso relacionados**
CU-016

**Pantallas relacionadas**
PT-BOD-005

**Observaciones**
—

---
### API-011 — Consultar catálogo de vinos / Buscar y filtrar

**Código**
API-011


**Nombre**
Consultar catálogo de vinos / Buscar y filtrar

**Objetivo**
Permitir que el comprador descubra vinos publicados y disponibles, con búsqueda y filtros básicos.

**Método HTTP**
GET

**Ruta**
`/vinos`

**Actor autorizado**
Visitante, Comprador

**Parámetros de entrada**
texto de búsqueda y filtros básicos (opcionales); paginación

**Validaciones**
Solo se muestran vinos publicados de bodegas validadas. Los filtros solo aplican sobre vinos publicados.

**Respuesta correcta**
200 OK. Listado de vinos publicados y disponibles, o resultados de búsqueda.

**Posibles errores**
— (sin resultados se resuelve como listado vacío, no como error)

**Casos de uso relacionados**
CU-004 / CU-005

**Pantallas relacionadas**
PT-PUB-002

**Observaciones**
—

---
### API-012 — Ver ficha de vino

**Código**
API-012


**Nombre**
Ver ficha de vino

**Objetivo**
Mostrar la información comercial necesaria para que el comprador decida añadir un vino al carrito.

**Método HTTP**
GET

**Ruta**
`/vinos/{id}`

**Actor autorizado**
Visitante, Comprador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino existe, está publicado y la bodega propietaria está validada.

**Respuesta correcta**
200 OK. Ficha completa del vino.

**Posibles errores**
404 vino no encontrado, no publicado o bodega no validada.

**Casos de uso relacionados**
CU-006

**Pantallas relacionadas**
PT-PUB-003

**Observaciones**
Un vino publicado pero no disponible se muestra como no disponible y no puede añadirse al carrito.

---
### API-013 — Listar vinos propios de bodega

**Código**
API-013


**Nombre**
Listar vinos propios de bodega

**Objetivo**
Permitir que la bodega autenticada vea todos sus vinos, incluidos los no publicados o pendientes de revisión.

**Método HTTP**
GET

**Ruta**
`/bodegas/yo/vinos`

**Actor autorizado**
Bodega

**Parámetros de entrada**
Filtro opcional por estado; paginación.

**Validaciones**
Bodega autenticada; solo se listan vinos propios.

**Respuesta correcta**
200 OK. Listado de vinos propios en cualquier estado.

**Posibles errores**
401 no autenticado.

**Casos de uso relacionados**
CU-015 / CU-016 / CU-017

**Pantallas relacionadas**
PT-BOD-003

**Observaciones**
A diferencia del catálogo público, incluye vinos en borrador y pendientes de revisión. Brecha 3 de la Auditoría de cobertura v1.0.

---

### API-014 — Consultar detalle de vino propio

**Código**
API-014


**Nombre**
Consultar detalle de vino propio

**Objetivo**
Permitir que la bodega consulte un vino propio aunque todavía no sea público.

**Método HTTP**
GET

**Ruta**
`/bodegas/yo/vinos/{id}`

**Actor autorizado**
Bodega

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino debe pertenecer a la bodega autenticada.

**Respuesta correcta**
200 OK. Detalle completo del vino, en cualquier estado.

**Posibles errores**
403 no pertenece a la bodega · 404 no encontrado.

**Casos de uso relacionados**
CU-015 / CU-016 / CU-017

**Pantallas relacionadas**
PT-BOD-006

**Observaciones**
Brecha 4 de la Auditoría de cobertura v1.0.

---

### API-015 — Solicitar publicación de vino

**Código**
API-015


**Nombre**
Solicitar publicación de vino

**Objetivo**
Permitir que la bodega solicite la revisión y posible publicación de un vino propio, sin poder publicarlo directamente.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos/{id}/solicitar-publicacion`

**Actor autorizado**
Bodega

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino pertenece a la bodega; tiene información mínima completa (precio, disponibilidad); no está ya publicado ni pendiente de revisión.

**Respuesta correcta**
200 OK. Vino pasa a estado de revisión pendiente.

**Posibles errores**
400 información incompleta · 403 no pertenece a la bodega · 409 ya publicado o ya pendiente.

**Casos de uso relacionados**
CU-017

**Pantallas relacionadas**
PT-BOD-003, PT-BOD-005, PT-BOD-006, PT-ADM-004

**Observaciones**
La bodega nunca publica directamente: publicar y despublicar siguen siendo exclusivas del Administrador (CU-023/024). Brecha 5 de la Auditoría de cobertura v1.0.

---


## Módulo: Carrito

### API-016 — Añadir vino al carrito

**Código**
API-016


**Nombre**
Añadir vino al carrito

**Objetivo**
Permitir que el comprador añada un vino disponible al carrito.

**Método HTTP**
POST

**Ruta**
`/carrito/items`

**Actor autorizado**
Comprador

**Parámetros de entrada**
vino_id, cantidad

**Validaciones**
El vino está publicado y disponible. La cantidad es válida y no supera la disponibilidad. Si el vino ya está en el carrito, se actualiza la cantidad.

**Respuesta correcta**
200 OK. Carrito actualizado con el importe recalculado.

**Posibles errores**
400 cantidad inválida · 409 stock insuficiente · 404 vino no encontrado, despublicado o no disponible.

**Casos de uso relacionados**
CU-007

**Pantallas relacionadas**
PT-COM-002

**Observaciones**
El carrito conserva la bodega asociada a cada vino.

---
### API-017 — Gestionar carrito — consultar

**Código**
API-017


**Nombre**
Gestionar carrito — consultar

**Objetivo**
Permitir que el comprador revise los vinos del carrito antes del checkout.

**Método HTTP**
GET

**Ruta**
`/carrito`

**Actor autorizado**
Comprador

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
### API-018 — Gestionar carrito — modificar cantidad

**Código**
API-018


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
### API-019 — Gestionar carrito — eliminar producto

**Código**
API-019


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
### API-020 — Gestionar carrito — vaciar

**Código**
API-020


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

### API-021 — Realizar checkout

**Código**
API-021


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
### API-022 — Pagar Pedido

**Código**
API-022


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
### API-023 — Consultar confirmación de Pedido

**Código**
API-023


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

### API-024 — Consultar Pedidos

**Código**
API-024


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
### API-025 — Consultar detalle de Pedido

**Código**
API-025


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

### API-026 — Consultar SubPedidos de bodega

**Código**
API-026


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
### API-027 — Consultar detalle de SubPedido

**Código**
API-027


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
### API-028 — Cambiar estado de SubPedido

**Código**
API-028


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

### API-029 — Listar bodegas pendientes de validación

**Código**
API-029


**Nombre**
Listar bodegas pendientes de validación

**Objetivo**
Permitir que el administrador consulte las solicitudes de bodega pendientes de validar.

**Método HTTP**
GET

**Ruta**
`/admin/bodegas?estado=pendiente`

**Actor autorizado**
Administrador

**Parámetros de entrada**
Filtro de estado; paginación.

**Validaciones**
Administrador autenticado.

**Respuesta correcta**
200 OK. Listado de bodegas pendientes.

**Posibles errores**
401 no autenticado · 403 sin permisos.

**Casos de uso relacionados**
CU-021

**Pantallas relacionadas**
PT-ADM-002

**Observaciones**
Precede a la validación de bodega. Brecha 6 de la Auditoría de cobertura v1.0.

---

### API-030 — Consultar detalle administrativo de bodega

**Código**
API-030


**Nombre**
Consultar detalle administrativo de bodega

**Objetivo**
Permitir que el administrador revise el detalle completo de una bodega antes de validarla.

**Método HTTP**
GET

**Ruta**
`/admin/bodegas/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
Administrador autenticado; la bodega debe existir.

**Respuesta correcta**
200 OK. Detalle completo de la bodega.

**Posibles errores**
401 · 403 · 404 no encontrada.

**Casos de uso relacionados**
CU-021

**Pantallas relacionadas**
PT-ADM-003

**Observaciones**
Brecha 7 de la Auditoría de cobertura v1.0.

---

### API-031 — Validar bodega

**Código**
API-031


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
### API-032 — Listar vinos pendientes de revisión

**Código**
API-032


**Nombre**
Listar vinos pendientes de revisión

**Objetivo**
Permitir que el administrador consulte los vinos que las bodegas han solicitado publicar.

**Método HTTP**
GET

**Ruta**
`/admin/vinos?estado=pendiente_revision`

**Actor autorizado**
Administrador

**Parámetros de entrada**
Filtro de estado; paginación.

**Validaciones**
Administrador autenticado.

**Respuesta correcta**
200 OK. Listado de vinos pendientes de revisión.

**Posibles errores**
401 · 403.

**Casos de uso relacionados**
CU-022 / CU-023 / CU-024

**Pantallas relacionadas**
PT-ADM-004

**Observaciones**
Precede a Publicar/Despublicar vino. Brecha 8 de la Auditoría de cobertura v1.0.

---

### API-033 — Consultar detalle administrativo de vino

**Código**
API-033


**Nombre**
Consultar detalle administrativo de vino

**Objetivo**
Permitir que el administrador revise el detalle completo de un vino antes de decidir su publicación.

**Método HTTP**
GET

**Ruta**
`/admin/vinos/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
Administrador autenticado; el vino debe existir.

**Respuesta correcta**
200 OK. Detalle completo, incluida la bodega propietaria y su estado de validación.

**Posibles errores**
401 · 403 · 404 no encontrado.

**Casos de uso relacionados**
CU-022 / CU-023 / CU-024

**Pantallas relacionadas**
PT-ADM-005

**Observaciones**
Brecha 9 de la Auditoría de cobertura v1.0.

---

### API-034 — Publicar vino

**Código**
API-034


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
### API-035 — Despublicar vino

**Código**
API-035


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
### API-036 — Consultar Pedidos como administrador

**Código**
API-036


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
### API-037 — Consultar detalle administrativo de Pedido

**Código**
API-037


**Nombre**
Consultar detalle administrativo de Pedido

**Objetivo**
Formalizar la consulta individual de un Pedido concreto por parte del administrador.

**Método HTTP**
GET

**Ruta**
`/admin/pedidos/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
Administrador autenticado; el Pedido debe existir.

**Respuesta correcta**
200 OK. Detalle completo del Pedido, incluidos SubPedidos como información operativa interna.

**Posibles errores**
401 · 403 · 404 no encontrado.

**Casos de uso relacionados**
CU-025

**Pantallas relacionadas**
PT-ADM-007

**Observaciones**
El listado ya existía (Consultar Pedidos como administrador); esta es la ruta de detalle individual que faltaba formalizar. Brecha 10 de la Auditoría de cobertura v1.0.

---

### API-038 — Listar incidencias

**Código**
API-038


**Nombre**
Listar incidencias

**Objetivo**
Permitir que el administrador consulte las incidencias abiertas y su estado.

**Método HTTP**
GET

**Ruta**
`/admin/incidencias`

**Actor autorizado**
Administrador

**Parámetros de entrada**
Filtro de estado; paginación.

**Validaciones**
Administrador autenticado.

**Respuesta correcta**
200 OK. Listado de incidencias.

**Posibles errores**
401 · 403.

**Casos de uso relacionados**
CU-027

**Pantallas relacionadas**
PT-ADM-008

**Observaciones**
Brecha 11 de la Auditoría de cobertura v1.0.

---

### API-039 — Consultar detalle de incidencia

**Código**
API-039


**Nombre**
Consultar detalle de incidencia

**Objetivo**
Permitir que el administrador revise el detalle completo de una incidencia.

**Método HTTP**
GET

**Ruta**
`/admin/incidencias/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
Administrador autenticado; la incidencia debe existir.

**Respuesta correcta**
200 OK. Detalle completo, incluido el recurso relacionado (Pedido, SubPedido, vino o bodega).

**Posibles errores**
401 · 403 · 404 no encontrada.

**Casos de uso relacionados**
CU-027

**Pantallas relacionadas**
PT-ADM-009

**Observaciones**
Brecha 12 de la Auditoría de cobertura v1.0.

---

### API-040 — Actualizar estado de incidencia

**Código**
API-040


**Nombre**
Actualizar estado de incidencia

**Objetivo**
Permitir que el administrador cambie el estado de una incidencia dentro de las transiciones permitidas.

**Método HTTP**
PATCH

**Ruta**
`/admin/incidencias/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
estado_destino

**Validaciones**
Administrador autenticado; la incidencia debe existir; la transición debe estar permitida para el estado actual.

**Respuesta correcta**
200 OK. Incidencia actualizada; se registra el cambio para auditoría.

**Posibles errores**
401 · 403 · 404 · 409 transición no permitida.

**Casos de uso relacionados**
CU-027

**Pantallas relacionadas**
PT-ADM-008, PT-ADM-009

**Observaciones**
Todo cambio de estado de incidencia genera un registro en la tabla `auditoria` (INF-05). Brecha 13 de la Auditoría de cobertura v1.0.

---

### API-041 — Consultar dashboard administrativo

**Código**
API-041


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

### API-042 — Webhook de Stripe

**Código**
API-042


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

---

## Matriz de trazabilidad CU/PT → API

| API | Caso de Uso | Pantalla |
|---|---|---|
| API-001 | CU-001 | PT-ACC-001 |
| API-002 | CU-002 | PT-ACC-003 |
| API-003 | CU-003 | PT-ACC-004 |
| API-004 | CU-003 | PT-ACC-005 |
| API-005 | CU-012 | PT-ACC-002 |
| API-006 | CU-014 | PT-BOD-002 |
| API-007 | CU-006 (navegación alternativa) | PT-PUB-004 |
| API-008 | CU-014 | PT-BOD-002 |
| API-009 | CU-015 | PT-BOD-004 |
| API-010 | CU-016 | PT-BOD-005 |
| API-011 | CU-004 / CU-005 | PT-PUB-002 |
| API-012 | CU-006 | PT-PUB-003 |
| API-013 | CU-015 / CU-016 / CU-017 | PT-BOD-003 |
| API-014 | CU-015 / CU-016 / CU-017 | PT-BOD-006 |
| API-015 | CU-017 | PT-BOD-003, PT-BOD-005, PT-BOD-006, PT-ADM-004 |
| API-016 | CU-007 | PT-COM-002 |
| API-017 | CU-008 | PT-COM-002 |
| API-018 | CU-008 | PT-COM-002 |
| API-019 | CU-008 | PT-COM-002 |
| API-020 | CU-008 | PT-COM-002 |
| API-021 | CU-009 | PT-COM-003 |
| API-022 | CU-010 | PT-COM-004 |
| API-023 | CU-010 / CU-028 | PT-COM-005 |
| API-024 | CU-011 | PT-COM-006 |
| API-025 | CU-011 | PT-COM-007 |
| API-026 | CU-018 | PT-BOD-007 |
| API-027 | CU-018 | PT-BOD-008 |
| API-028 | CU-019 | PT-BOD-008 |
| API-029 | CU-021 | PT-ADM-002 |
| API-030 | CU-021 | PT-ADM-003 |
| API-031 | CU-021 | PT-ADM-002 / PT-ADM-003 |
| API-032 | CU-022 / CU-023 / CU-024 | PT-ADM-004 |
| API-033 | CU-022 / CU-023 / CU-024 | PT-ADM-005 |
| API-034 | CU-023 | PT-ADM-004 / PT-ADM-005 |
| API-035 | CU-024 | PT-ADM-004 / PT-ADM-005 |
| API-036 | CU-025 | PT-ADM-006 / PT-ADM-007 |
| API-037 | CU-025 | PT-ADM-007 |
| API-038 | CU-027 | PT-ADM-008 |
| API-039 | CU-027 | PT-ADM-009 |
| API-040 | CU-027 | PT-ADM-008, PT-ADM-009 |
| API-041 | CU-026 | PT-ADM-001 |
| API-042 | CU-028 / CU-029 | — |

Matriz completa: 42 endpoints, cada uno con Caso de Uso y/o Pantalla trazados. Ninguna de las 36 pantallas de CAP-05 ni de los 32 Casos de Uso de CAP-06 queda sin al menos un endpoint que la implemente, cerrando las 13 brechas identificadas en la Auditoría de cobertura v1.0.


*INF-08 v2.2 — 42 endpoints en 9 módulos. Cierra las 13 brechas de la Auditoría de cobertura v1.0. Los 29 endpoints previos se conservan sin cambio de contrato, salvo la confirmación de credenciales en el registro de bodega (Solicitar registro como bodega, ADR-002). Estado: EN REVISIÓN.*
