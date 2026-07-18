# INF-08 – Especificación de APIs

**Teralya · Versión 2.6 · 17/07/2026 · APROBADO POR EL CTO CON AUTORIZACIÓN DEL CEO**

*INF-08 v2.6 incorpora API-051 para ejecutar la cancelación contractual ya aprobada en LEGAL-07 y CAP-09, y precisa en API-006/API-030/API-031 las condiciones de envío ya exigidas por LEGAL-09. Mantiene los 11 módulos, la arquitectura y el alcance comercial del MVP.*
Especificación funcional de las APIs del MVP, derivada directamente de los Casos de Uso de CAP-06 y las Pantallas de CAP-05. Documento puramente funcional: no incluye código, no diseña la implementación, no especifica TypeScript ni SQL, no diseña autenticación JWT ni Supabase. 51 endpoints en 11 módulos (API-001 a API-051); API-051 completa la cancelación directa ya exigida y no introduce un módulo nuevo.

## Índice de módulos

1. Autenticación (4) · 2. Bodegas (4) · 3. Vinos (7) · 4. Carrito (5) · 5. Checkout (3) · 6. Pedidos (3) · 7. SubPedidos (3) · 8. Administración (13) · 9. Sistema (1) · 10. Direcciones (4) · 11. Imágenes (4)

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
201 Created. Devuelve el usuario creado y token de sesión. Si existe un carrito local de visitante, el cliente autenticado inicia su fusión con el carrito persistente.

**Posibles errores**
400 datos inválidos · 400 edad insuficiente · 409 email ya registrado.

**Casos de uso relacionados**
CU-001

**Pantallas relacionadas**
PT-ACC-001

**Observaciones**
Registra en auditoría la aceptación, su fecha/hora y la versión de las condiciones aceptadas. La fusión revalida cada línea y no persiste carritos anónimos ni líneas inválidas. Sin verificación documental de identidad en el MVP.

---

### API-002 — Iniciar sesión

**Código**
API-002

**Nombre**
Iniciar sesión

**Objetivo**
Permitir que comprador, bodega o administrador accedan a su área correspondiente y, para el Comprador, conservar su selección local válida.

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
200 OK. Devuelve el usuario autenticado y token de sesión; redirige según rol. Si el actor es Comprador y existe carrito local, el cliente inicia la fusión idempotente con su carrito persistente.

**Posibles errores**
401 credenciales incorrectas · 403 cuenta no activa · 403 bodega no validada.

**Casos de uso relacionados**
CU-002 / CU-013 / CU-020

**Pantallas relacionadas**
PT-ACC-003, PT-BOD-001, PT-ADM-001, PT-SIS-003

**Observaciones**
La fusión conserva una sola línea por vino, revalida publicación, disponibilidad, cantidad y precio, informa líneas descartadas y no crea un carrito persistente anónimo. Si no existe carrito local, el acceso no altera el carrito persistente.

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
Campos editables de perfil público y contacto; países de envío, plazo de preparación, plazo estimado de entrega, descripción del coste, transportista habitual, restricciones, empaquetado y capacidad internacional.

**Validaciones**
Bodega autenticada y validada. Formatos válidos. La bodega solo edita su propio perfil. Los códigos de país se normalizan en mayúsculas, se deduplican, deben tener dos letras y se limitan a 27.

**Respuesta correcta**
200 OK. Perfil y condiciones de envío actualizados.

**Posibles errores**
400 campos o formatos inválidos · 401 no autenticado · 403 no autorizado · 409 conflicto de unicidad.

**Casos de uso relacionados**
CU-014 / CU-034

**Pantallas relacionadas**
PT-BOD-002

**Observaciones**
La información logística es declarativa y no sustituye el importe final calculado en checkout ni la responsabilidad legal de la Bodega.

---


### API-030 — Consultar ficha pública de bodega

**Código**
API-030

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
200 OK. Perfil público, condiciones de envío autorizadas y vinos publicados de la Bodega.

**Posibles errores**
404 bodega no encontrada o no validada.

**Casos de uso relacionados**
CU-006 / CU-034

**Pantallas relacionadas**
PT-PUB-004

**Observaciones**
Complementa la ficha de vino cuando el comprador navega desde el vino hacia la Bodega. Solo expone destinos, plazos, coste descriptivo, transportista, restricciones, empaquetado y capacidad internacional; nunca comisión, verificación ni datos internos.

---

### API-031 — Consultar perfil propio de bodega

**Código**
API-031

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
200 OK. Datos completos autorizados del perfil propio, incluidas las condiciones de envío.

**Posibles errores**
401 no autenticado · 403 rol o asociación inválidos · 404 Bodega no encontrada.

**Casos de uso relacionados**
CU-014 / CU-034

**Pantallas relacionadas**
PT-BOD-002

**Observaciones**
Complementa a API-006 y permite editar el mismo contrato de campos sin exponer comisión, verificación, auditoría ni credenciales.

---


## Módulo: Vinos

### API-007 — Crear vino

**Código**
API-007

**Nombre**
Crear vino

**Objetivo**
Permitir que una bodega cree un vino no publicado y lo prepare para una solicitud posterior de revisión.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos`

**Actor autorizado**
Bodega

**Parámetros de entrada**
información mínima del vino, precio, disponibilidad

**Validaciones**
Bodega autenticada y validada. Precio y disponibilidad válidos. El vino se guarda sin publicar y todavía no queda en `pendiente_revision`.

**Respuesta correcta**
201 Created. Vino creado como no publicado, en su estado inicial previo a la solicitud de revisión.

**Posibles errores**
400 información obligatoria incompleta · 400 precio o disponibilidad inválidos.

**Casos de uso relacionados**
CU-015

**Pantallas relacionadas**
PT-BOD-004

**Observaciones**
El paso a `pendiente_revision` ocurre únicamente mediante la solicitud de publicación de CU-017/API-034. El vino no es visible para compradores hasta que Administración lo publique.

---

### API-008 — Editar vino propio

**Código**
API-008

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


### API-009 — Consultar catálogo de vinos / Buscar y filtrar

**Código**
API-009

**Nombre**
Consultar catálogo de vinos / Buscar y filtrar

**Objetivo**
Permitir que Visitante y Comprador descubran vinos publicados y disponibles, con búsqueda y filtros básicos.

**Método HTTP**
GET

**Ruta**
`/vinos`

**Actor autorizado**
Visitante, Comprador

**Parámetros de entrada**
texto de búsqueda y filtros básicos (opcionales); paginación

**Validaciones**
Solo se muestran vinos publicados y disponibles pertenecientes a bodegas validadas. Los filtros se aplican exclusivamente sobre ese conjunto.

**Respuesta correcta**
200 OK. Listado de vinos publicados y disponibles, o listado vacío cuando no hay coincidencias.

**Posibles errores**
— (sin resultados se resuelve como listado vacío, no como error)

**Casos de uso relacionados**
CU-004 / CU-005

**Pantallas relacionadas**
PT-PUB-002

**Observaciones**
Un vino despublicado, no disponible o perteneciente a una bodega no validada queda excluido del catálogo y la búsqueda.

---

### API-010 — Ver ficha de vino

**Código**
API-010

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


### API-032 — Listar vinos propios de bodega

**Código**
API-032

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
A diferencia del catálogo público (API-009), incluye vinos en borrador y pendientes de revisión. Brecha 3 de la Auditoría de cobertura v1.0.

---

### API-033 — Consultar detalle de vino propio

**Código**
API-033

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

### API-034 — Solicitar publicación de vino

**Código**
API-034

**Nombre**
Solicitar publicación de vino

**Objetivo**
Permitir que una bodega validada solicite la revisión de un vino propio, sin publicarlo directamente.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos/{id}/solicitar-publicacion`

**Actor autorizado**
Bodega

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
Bodega autenticada, validada y asociada al usuario. El vino pertenece a esa bodega, tiene información mínima completa, precio y disponibilidad válidos, al menos una imagen confirmada y activa, y está en su estado inicial no publicado; no está publicado ni en `pendiente_revision`.

**Respuesta correcta**
200 OK. El vino cambia exactamente a `pendiente_revision` y continúa sin estar publicado.

**Posibles errores**
400 información/precio/disponibilidad inválidos o ausencia de imagen confirmada y activa · 403 bodega no validada o asociación inválida · 404 vino inexistente o ajeno · 409 ya publicado o ya en `pendiente_revision`.

**Casos de uso relacionados**
CU-017

**Pantallas relacionadas**
PT-BOD-003, PT-BOD-005, PT-BOD-006, PT-ADM-004

**Observaciones**
La bodega nunca publica directamente; API-025 y API-026 son exclusivas de Administración.

---

## Módulo: Carrito

### API-011 — Añadir vino o fusionar carrito local

**Código**
API-011

**Nombre**
Añadir vino al carrito / Fusionar carrito local autenticado

**Objetivo**
Permitir que el Comprador añada un vino válido o fusione, tras registro o inicio de sesión, el carrito local del Visitante con su carrito persistente.

**Método HTTP**
POST

**Ruta**
`/carrito/items`

**Actor autorizado**
Comprador

**Parámetros de entrada**
Modo ordinario: vino_id, cantidad. Modo fusión: `fusion_id` único e items locales [{vino_id, cantidad_local}].

**Validaciones**
Comunes: Comprador autenticado y único carrito persistente activo.
Modo ordinario: el vino está publicado, disponible y pertenece a bodega validada; cantidad positiva y no superior al stock.
Modo fusión: estructura y `fusion_id` válidos. Cada línea se evalúa individualmente; vino inexistente, despublicado, no disponible, bodega no validada o cantidad no positiva se descarta con motivo. Si la suma supera stock, se limita al stock y se informa, sin rechazar toda la fusión.

**Respuesta correcta**
200 OK. Modo ordinario: crea o actualiza una única línea por vino y devuelve el carrito recalculado. Modo fusión: procesa transaccionalmente el conjunto, establece por coincidencia `min(stock_disponible, cantidad_persistente + cantidad_local)`, conserva las líneas válidas y devuelve el carrito completo más un resultado por línea: fusionada, limitada o descartada.

**Posibles errores**
Comunes: 401 sesión ausente.
Modo ordinario: 400 cantidad inválida · 404 vino inexistente/despublicado/no disponible · 409 stock insuficiente.
Modo fusión: 400 envoltorio o `fusion_id` inválido · 409 `fusion_id` ya registrado con contenido diferente. Las incidencias de líneas se devuelven dentro del 200 parcial y no como error global.

**Casos de uso relacionados**
CU-002 / CU-007 / CU-008

**Pantallas relacionadas**
PT-ACC-001, PT-ACC-003, PT-COM-002

**Observaciones**
Repetir el mismo `fusion_id` con el mismo contenido devuelve exactamente el resultado registrado y no vuelve a sumar cantidades. El carrito visitante nunca se persiste antes de autenticar. DLOG 0010, 0016 y 0017.

---

### API-012 — Gestionar carrito — consultar

**Código**
API-012

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
Confirmar los datos necesarios para preparar un único Pedido antes del pago.

**Método HTTP**
POST

**Ruta**
`/checkout`

**Actor autorizado**
Comprador

**Parámetros de entrada**
direccion_envio_id, direccion_facturacion_id

**Validaciones**
Comprador autenticado. Carrito activo no vacío. Líneas, precios y disponibilidad revalidados. Ambas direcciones existen, pertenecen al comprador y están activas; la primera está habilitada para envío y la segunda para facturación. Pueden ser el mismo registro únicamente si admite ambos usos. Un carrito activo solo puede originar un Pedido `pendiente_pago`; el reintento devuelve el ya creado.

**Respuesta correcta**
200 OK. Pedido `pendiente_pago` preparado con total calculado y referencias a ambas direcciones. Los snapshots de envío y facturación se congelan al crear por primera vez el Pedido; API-029 conserva esos snapshots y congela líneas y precios tras la confirmación válida del pago.

**Posibles errores**
400 carrito vacío/datos incompletos/dirección no habilitada · 403 dirección ajena · 404 dirección inexistente o inactiva · 409 disponibilidad o precio cambiado.

**Casos de uso relacionados**
CU-009

**Pantallas relacionadas**
PT-COM-003

**Observaciones**
No se inicia el pago si el checkout no es válido. Operación idempotente por carrito activo mientras exista su Pedido `pendiente_pago`. DLOG 0016.

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
El Pedido está `pendiente_pago`, el Pago relacionado está `pendiente` o `cancelado` por expiración de sesión y el importe/moneda son válidos. Solo puede existir una sesión activa de Stripe Checkout por Pedido. Si sustituye una sesión expirada, bajo bloqueo cambia `pago.estado` de `cancelado` a `pendiente` antes de exponer la nueva URL.

**Respuesta correcta**
200 OK. Crea o reutiliza la sesión de Stripe Checkout y devuelve `pedido_id`, URL de redirección, expiración y `reused`. La operación no confirma ni rechaza el cobro.

**Posibles errores**
400 request inválido · 401 sesión ausente · 404 Pedido inexistente o ajeno · 409 Pedido no `pendiente_pago`, total/moneda inválidos o relación Pago–Pedido incoherente · 502 respuesta inválida de Stripe · 503 timeout o indisponibilidad de Stripe.

**Casos de uso relacionados**
CU-010

**Pantallas relacionadas**
PT-COM-004

**Observaciones**
El Pedido solo se confirma mediante API-029. API-017 es idempotente por `pedido_id`: reutiliza la sesión válida; si expiró, bajo bloqueo crea como máximo una sustituta y reactiva el Pago a `pendiente` antes de responder. Los rechazos o cancelaciones se reflejan después mediante eventos permitidos, nunca con un 402 sincrónico. DLOG 0020.

---


### API-018 — Consultar confirmación de Pedido

**Código**
API-018

**Nombre**
Consultar confirmación de Pedido

**Objetivo**
Permitir que el comprador consulte el resultado persistido de su Pedido tras el retorno desde Stripe Checkout.

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
200 OK. Devuelve la confirmación únicamente si API-029 ya procesó con éxito el webhook firmado y `pago.estado` refleja pago aprobado.

**Posibles errores**
404 Pedido no encontrado o pago aún no confirmado.

**Casos de uso relacionados**
CU-010 / CU-028

**Pantallas relacionadas**
PT-COM-005

**Observaciones**
El retorno del navegador y esta consulta no confirman pagos; solo presentan el resultado cuya autoridad es API-029.

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
200 OK. Detalle del Pedido, estado global, líneas, direcciones congeladas, `puede_cancelar` y, cuando existe, resumen de la cancelación.

**Posibles errores**
401 sesión ausente · 403 acceso no autorizado · 404 Pedido no encontrado.

**Casos de uso relacionados**
CU-011 / CU-033

**Pantallas relacionadas**
PT-COM-007

**Observaciones**
El estado mostrado es el estado global del Pedido. El Comprador no recibe SubPedidos como unidad funcional ni referencias internas de Stripe.

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
Cambiar estado de SubPedido y recalcular Pedido

**Objetivo**
Permitir que la bodega actualice el estado operativo de un SubPedido propio y derivar de forma determinista el estado global del Pedido.

**Método HTTP**
PATCH

**Ruta**
`/bodegas/yo/subpedidos/{id}/estado`

**Actor autorizado**
Bodega

**Parámetros de entrada**
estado_destino

**Validaciones**
El SubPedido pertenece a la bodega asociada al usuario y la bodega está validada. Matriz permitida: `pendiente→aceptado|cancelado|incidencia`; `aceptado→en_preparacion|cancelado|incidencia`; `en_preparacion→enviado|cancelado|incidencia`; `incidencia→en_preparacion|cancelado`; `enviado→entregado`. `entregado` y `cancelado` son terminales. Solicitar el mismo estado es idempotente y devuelve 200 sin nueva mutación.

**Respuesta correcta**
200 OK. Actualiza `subpedido.estado`, única fuente logística, y recalcula `pedido.estado` usando todos sus SubPedidos:
- todos los no cancelados están `pendiente` y existe al menos uno no cancelado → `pagado`;
- ninguno enviado/entregado y al menos uno `aceptado`, `en_preparacion` o `incidencia` → `en_preparacion`;
- existe al menos uno `enviado` o `entregado` y otro sigue `pendiente`, `aceptado`, `en_preparacion` o `incidencia` → `parcialmente_enviado`;
- todos los no cancelados están en `enviado` o `entregado`, y al menos uno sigue `enviado` → `enviado`;
- todos los no cancelados están `entregado` y existe al menos uno no cancelado → `entregado`;
- todos están `cancelado` → `cancelado`.

**Posibles errores**
403 bodega no validada o asociación usuario–bodega inválida · 404 SubPedido inexistente o ajeno · 409 transición no enumerada, estado terminal o relación inconsistente.

**Casos de uso relacionados**
CU-019 / CU-030

**Pantallas relacionadas**
PT-BOD-008, PT-COM-007, PT-ADM-007

**Observaciones**
La bodega no modifica directamente `pedido.estado`. El cambio de SubPedido y el recálculo global se ejecutan en una transacción con bloqueo del Pedido y sus SubPedidos. Las incidencias posteriores al envío se registran en la entidad Incidencia sin retroceder el estado logístico. `pendiente_pago` y `devuelto` quedan fuera de esta matriz. DLOG 0005, 0018 y 0020.

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
Permitir que el administrador haga visible y comprable un vino previamente enviado a revisión.

**Método HTTP**
POST

**Ruta**
`/admin/vinos/{id}/publicar`

**Actor autorizado**
Administrador

**Parámetros de entrada**
id (en la ruta)

**Validaciones**
El vino existe y está exactamente en `pendiente_revision`; tiene información obligatoria completa, precio y disponibilidad válidos y al menos una imagen confirmada y activa; la bodega propietaria está validada.

**Respuesta correcta**
200 OK. Vino publicado; visible en catálogo, búsqueda y ficha pública mientras siga disponible y su bodega continúe validada.

**Posibles errores**
400 vino incompleto, sin imagen o con precio/disponibilidad inválidos · 400 bodega no validada · 404 vino no encontrado · 409 estado distinto de `pendiente_revision`.

**Casos de uso relacionados**
CU-023

**Pantallas relacionadas**
PT-ADM-004 / PT-ADM-005

**Observaciones**
Solo el administrador puede publicar. La bodega únicamente solicita la revisión mediante API-034; no existe publicación directa desde el estado inicial no publicado.

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


### API-035 — Listar bodegas pendientes de validación

**Código**
API-035

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
Precede a la validación de bodega (API-024). Brecha 6 de la Auditoría de cobertura v1.0.

---

### API-036 — Consultar detalle administrativo de bodega

**Código**
API-036

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

### API-037 — Listar vinos pendientes de revisión

**Código**
API-037

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
Precede a Publicar (API-025) / Despublicar (API-026) vino. Brecha 8 de la Auditoría de cobertura v1.0.

---

### API-038 — Consultar detalle administrativo de vino

**Código**
API-038

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

### API-039 — Consultar detalle administrativo de Pedido

**Código**
API-039

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
El listado ya existía (API-027); esta es la ruta de detalle individual que faltaba formalizar. Brecha 10 de la Auditoría de cobertura v1.0.

---

### API-040 — Listar incidencias

**Código**
API-040

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

### API-041 — Consultar detalle de incidencia

**Código**
API-041

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

### API-042 — Actualizar estado de incidencia

**Código**
API-042

**Nombre**
Actualizar estado de incidencia

**Objetivo**
Permitir que el administrador avance una incidencia por el ciclo mínimo auditable del MVP.

**Método HTTP**
PATCH

**Ruta**
`/admin/incidencias/{id}`

**Actor autorizado**
Administrador

**Parámetros de entrada**
estado_destino

**Validaciones**
Administrador autenticado. Incidencia existente y asociada al menos a Pedido, SubPedido, Bodega o Vino. Solo se permiten las transiciones consecutivas `abierta → en_revision → resuelta → cerrada`; se prohíben saltos, retrocesos y reaperturas.

**Respuesta correcta**
200 OK. Incidencia actualizada al siguiente estado y cambio registrado automáticamente en `auditoria`.

**Posibles errores**
401 sesión ausente · 403 rol insuficiente · 404 incidencia inexistente · 409 salto, retroceso, reapertura o relación inválida.

**Casos de uso relacionados**
CU-027

**Pantallas relacionadas**
PT-ADM-008, PT-ADM-009

**Observaciones**
Una incidencia cerrada es terminal en el MVP. DLOG 0015.

---

## Módulo: Sistema

### API-029 — Webhook de Stripe

**Código**
API-029

**Nombre**
Webhook de Stripe — confirmar pago y generar SubPedidos

**Objetivo**
Procesar la autoridad económica de Stripe de forma firmada, idempotente y atómica para confirmar el pago y materializar la división operativa del Pedido.

**Método HTTP**
POST

**Ruta**
`/sistema/webhooks/stripe`

**Actor autorizado**
Stripe mediante firma verificada

**Parámetros de entrada**
Payload Stripe, firma Stripe y `stripe_event_id`.

**Validaciones**
Firma `Stripe-Signature` válida sobre el body crudo con tolerancia máxima de 300 segundos. Allowlist: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`. `event.id` es la clave del ledger. Entorno/livemode, Session ID, metadata `pedido_id`/`pago_id`, moneda `eur` e importe en céntimos coinciden exactamente con Pedido/Pago.

**Respuesta correcta**
200 OK. Registra el evento. `checkout.session.completed` con `payment_status=paid` y `checkout.session.async_payment_succeeded` confirman atómicamente Pago/Pedido, conservan snapshots de direcciones, congelan líneas/precios, aplican stock y crean un SubPedido por Pedido–Bodega. Un `completed` no pagado queda sin efecto comercial. `async_payment_failed` marca Pago fallido y `expired` lo marca cancelado, ambos sin stock ni SubPedidos.

**Posibles errores**
400 body/firma inválidos · 404 Pedido/Pago inexistente · 409 entorno, sesión, metadata, importe, moneda o asociación discrepante · 422 tipo fuera de allowlist. Ningún error confirma ni genera SubPedidos.

**Casos de uso relacionados**
CU-028 / CU-029

**Pantallas relacionadas**
—

**Observaciones**
El primer procesamiento exitoso de un `stripe_event_id` produce como máximo un efecto comercial. Su reenvío devuelve 200 con el resultado registrado. No se admite `payment_intent.payment_failed`: un intento fallido puede recuperarse dentro de la misma Checkout Session. Cualquier fallo transaccional revierte el conjunto. DLOG 0014, 0016 y 0020.

---

## Módulo: Direcciones

### API-043 — Crear dirección propia

**Código**
API-043

**Nombre**
Crear dirección propia

**Objetivo**
Permitir que un Comprador o una Bodega validada registre una Dirección activa de envío, facturación o ambos usos.

**Método HTTP**
POST

**Ruta**
`/direcciones`

**Actor autorizado**
Comprador / Bodega validada

**Parámetros de entrada**
Idempotency-Key UUID; uso; nombre_destinatario; campos postales obligatorios; teléfono opcional; es_principal opcional. El propietario no forma parte del request. La clave UUID se usa como `direccion.id`.

**Validaciones**
Sesión válida. El propietario y su tipo se derivan de la sesión. Uso admitido. Campos postales completos. La misma clave y el mismo payload canónico devuelven el recurso con `direccion.id` igual a la clave; la misma clave con payload distinto devuelve conflicto. Existe como máximo una Dirección principal activa por propietario.

**Respuesta correcta**
201 Created en la primera creación; 200 OK en reintento idempotente. Dirección propia activa.

**Posibles errores**
400 datos inválidos · 401 sesión ausente · 403 actor no autorizado o bodega no validada · 409 clave reutilizada con payload distinto.

**Casos de uso relacionados**
CU-009 / CU-014

**Pantallas relacionadas**
PT-COM-003 / PT-BOD-002

**Observaciones**
No acepta comprador_id, bodega_id ni otro identificador arbitrario de propietario. DLOG 0019.

---

### API-044 — Consultar direcciones propias

**Código**
API-044

**Nombre**
Consultar direcciones propias

**Objetivo**
Listar las Direcciones activas del Comprador o Bodega autenticados.

**Método HTTP**
GET

**Ruta**
`/direcciones`

**Actor autorizado**
Comprador / Bodega validada

**Parámetros de entrada**
Filtro opcional de uso: envio, facturacion o ambos.

**Validaciones**
Sesión válida. Solo se consultan registros activos cuyo propietario se deriva de la sesión.

**Respuesta correcta**
200 OK. Lista de Direcciones propias activas con uso y condición de principal.

**Posibles errores**
400 filtro inválido · 401 sesión ausente · 403 actor no autorizado o bodega no validada.

**Casos de uso relacionados**
CU-009 / CU-014

**Pantallas relacionadas**
PT-COM-003 / PT-BOD-002

**Observaciones**
Nunca expone Direcciones ajenas.

---

### API-045 — Actualizar dirección propia

**Código**
API-045

**Nombre**
Actualizar dirección propia

**Objetivo**
Actualizar los datos editables de una Dirección activa propia.

**Método HTTP**
PATCH

**Ruta**
`/direcciones/{id}`

**Actor autorizado**
Comprador / Bodega validada

**Parámetros de entrada**
id en ruta; campos postales, uso, teléfono o es_principal que se deseen modificar.

**Validaciones**
La Dirección existe, está activa y pertenece al actor autenticado. id, propietario y estado activo son inmutables por esta operación. La actualización de principal es transaccional.

**Respuesta correcta**
200 OK. Dirección actualizada; como máximo una Dirección principal activa por propietario.

**Posibles errores**
400 datos inválidos · 401 sesión ausente · 403 actor no autorizado · 404 Dirección inexistente, ajena o inactiva · 409 conflicto de principal.

**Casos de uso relacionados**
CU-009 / CU-014

**Pantallas relacionadas**
PT-COM-003 / PT-BOD-002

**Observaciones**
Los snapshots ya incorporados a Pedidos no se modifican.

---

### API-046 — Desactivar dirección propia

**Código**
API-046

**Nombre**
Desactivar dirección propia

**Objetivo**
Retirar una Dirección propia del uso futuro sin borrar su histórico.

**Método HTTP**
DELETE

**Ruta**
`/direcciones/{id}`

**Actor autorizado**
Comprador / Bodega validada

**Parámetros de entrada**
id en ruta.

**Validaciones**
La Dirección pertenece al actor autenticado. Si está activa, no puede desactivarse cuando la usa un Pedido `pendiente_pago`; si ya está inactiva, el reintento finaliza sin efecto adicional.

**Respuesta correcta**
204 No Content tanto en la primera desactivación como en un reintento sobre la misma Dirección propia ya inactiva. Se retira es_principal y, cuando corresponda, se promueve transaccionalmente otra Dirección activa del mismo propietario.

**Posibles errores**
401 sesión ausente · 403 actor no autorizado · 404 Dirección inexistente o ajena · 409 Dirección activa vinculada a Pedido `pendiente_pago`.

**Casos de uso relacionados**
CU-009 / CU-014

**Pantallas relacionadas**
PT-COM-003 / PT-BOD-002

**Observaciones**
No borra el registro ni altera snapshots históricos. DLOG 0019.

---

## Módulo: Imágenes

### API-047 — Solicitar URL de carga de imagen de vino

**Código**
API-047

**Nombre**
Solicitar URL de carga de imagen de vino

**Objetivo**
Autorizar temporalmente la carga directa de una imagen para un vino propio sin transferir el binario por el backend.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos/{id}/imagenes/upload-url`

**Actor autorizado**
Bodega validada

**Parámetros de entrada**
id del vino en ruta; upload_id UUID —reutilizado como `imagen.id` al confirmar—; nombre de archivo; content_type; tamaño; checksum SHA-256 en base64.

**Validaciones**
El vino existe y pertenece a la bodega derivada de la sesión. Tipo, tamaño y checksum cumplen la tabla normativa TAPI-07 de INF-10. La clave de almacenamiento es determinista para bodega, vino y upload_id y la genera el servidor. Si `imagen.id = upload_id` ya fue confirmada, devuelve conflicto; mientras no exista Imagen confirmada, un reintento puede reemitir una autorización para la misma clave.

**Respuesta correcta**
200 OK. URL prefirmada temporal, método PUT, cabeceras firmadas requeridas, clave opaca y token firmado de confirmación que contiene actor/bodega, vino_id, upload_id, clave, MIME, bytes, checksum y expiración.

**Posibles errores**
400 metadatos inválidos · 401 sesión ausente · 403 rol, asociación o bodega no validada · 404 vino inexistente o ajeno · 409 upload_id ya confirmado.

**Casos de uso relacionados**
CU-016

**Pantallas relacionadas**
PT-BOD-005

**Observaciones**
No crea todavía el registro Imagen. Almacenamiento de objetos compatible con S3 y entrega posterior mediante CDN. Los límites, TTL y cabeceras firmadas se fijan normativamente en INF-10 TAPI-07. DLOG 0019.

---

### API-048 — Confirmar imagen cargada

**Código**
API-048

**Nombre**
Confirmar imagen cargada

**Objetivo**
Verificar el objeto cargado y registrar de forma idempotente una Imagen activa asociada al vino propio.

**Método HTTP**
POST

**Ruta**
`/bodegas/yo/vinos/{id}/imagenes`

**Actor autorizado**
Bodega validada

**Parámetros de entrada**
id del vino en ruta; upload_id; token de confirmación; texto_alternativo obligatorio, no vacío tras trim; orden opcional; es_principal opcional.

**Validaciones**
Se validan firma y expiración del token, actor/bodega y propiedad actual del vino. Mediante HEAD del almacenamiento, el objeto existe en la clave autorizada y coincide exactamente con MIME, bytes y checksum firmados. El texto alternativo es obligatorio y no vacío tras trim. `imagen.id` usa upload_id. La primera confirmación crea el registro; un replay idéntico devuelve el mismo recurso y el mismo upload_id con datos incompatibles devuelve conflicto.

**Respuesta correcta**
201 Created en la primera confirmación; 200 OK en reintento idéntico. Imagen confirmada, activa y servida por URL CDN estable.

**Posibles errores**
400 token inválido, texto alternativo ausente/vacío u objeto incompatible · 401 sesión ausente · 403 rol, asociación o bodega no validada · 404 vino inexistente/ajeno u objeto inexistente · 409 upload_id ya confirmado con datos incompatibles · 410 token expirado.

**Casos de uso relacionados**
CU-016

**Pantallas relacionadas**
PT-BOD-005

**Observaciones**
La promoción a principal se realiza de forma transaccional y deja como máximo una Imagen principal activa por vino.

---

### API-049 — Actualizar metadatos de imagen

**Código**
API-049

**Nombre**
Actualizar metadatos de imagen

**Objetivo**
Editar metadatos funcionales de una Imagen confirmada y activa de un vino propio.

**Método HTTP**
PATCH

**Ruta**
`/bodegas/yo/vinos/{id}/imagenes/{imagen_id}`

**Actor autorizado**
Bodega validada

**Parámetros de entrada**
id e imagen_id en ruta; texto_alternativo, orden o es_principal.

**Validaciones**
Vino e Imagen existen, pertenecen a la Bodega autenticada, están relacionados y la Imagen está activa. No se permite cambiar el objeto, propietario ni identificadores.

**Respuesta correcta**
200 OK. Metadatos actualizados; la condición de principal queda consistente transaccionalmente.

**Posibles errores**
400 datos inválidos · 401 sesión ausente · 403 rol, asociación o bodega no validada · 404 vino o Imagen inexistentes, ajenos, no relacionados o inactivos · 409 conflicto de principal.

**Casos de uso relacionados**
CU-016

**Pantallas relacionadas**
PT-BOD-005

**Observaciones**
No sustituye el binario; una nueva carga usa API-047 y API-048.

---

### API-050 — Desactivar imagen de vino

**Código**
API-050

**Nombre**
Desactivar imagen de vino

**Objetivo**
Retirar una Imagen de un vino propio sin borrar su registro histórico.

**Método HTTP**
DELETE

**Ruta**
`/bodegas/yo/vinos/{id}/imagenes/{imagen_id}`

**Actor autorizado**
Bodega validada

**Parámetros de entrada**
id e imagen_id en ruta.

**Validaciones**
Vino e Imagen existen, están relacionados y pertenecen a la Bodega autenticada. Si la Imagen está activa y el vino está `pendiente_revision` o `publicado`, debe permanecer al menos una Imagen confirmada y activa. Si la Imagen propia ya está inactiva, el reintento finaliza sin efecto adicional.

**Respuesta correcta**
204 No Content tanto en la primera desactivación como en un reintento sobre la misma Imagen propia ya inactiva. Se retira es_principal y, cuando corresponda, se promueve transaccionalmente otra Imagen activa. La limpieza física del objeto puede ser asíncrona.

**Posibles errores**
401 sesión ausente · 403 rol, asociación o bodega no validada · 404 vino o Imagen inexistentes, ajenos o no relacionados · 409 en el primer intento si es la última Imagen activa exigida por el estado del vino.

**Casos de uso relacionados**
CU-016 / CU-017 / CU-022 / CU-023

**Pantallas relacionadas**
PT-BOD-005 / PT-ADM-005

**Observaciones**
No borra el registro Imagen. DLOG 0019.

---

## Módulo: Pedidos — extensión de cierre contractual

### API-051 — Cancelar Pedido propio

**Código**
API-051

**Nombre**
Cancelar Pedido propio

**Objetivo**
Permitir que el Comprador cancele directamente un Pedido propio todavía reversible y solicitar el reembolso completo sin duplicar efectos económicos ni logísticos.

**Método HTTP**
POST

**Ruta**
`/pedidos/{id}/cancelacion`

**Actor autorizado**
Comprador autenticado y propietario del Pedido.

**Parámetros de entrada**
`id` UUID en la ruta. No existe body funcional.

**Validaciones**

- El Pedido existe y pertenece al Comprador.
- El Pago está `pagado` y conserva una sesión Stripe reembolsable.
- El Pedido está `pagado` o `en_preparacion`.
- Ningún SubPedido está `enviado`, `entregado` ni en `incidencia`.
- La solicitud se serializa mediante bloqueo de Pedido, Pago y ledger de cancelación.

**Respuesta correcta**
200 OK con `OrderCancellationResult`. Puede indicar `procesando`, `completada` o el resultado persistido de una cancelación ya completada.

**Efectos**

- Se crea como máximo una fila `cancelacion_pedido` por Pedido.
- Cada intento económico usa una clave de idempotencia Stripe determinista por Pedido e intento.
- `pending` y `requires_action` mantienen la solicitud `procesando` y bloquean transiciones logísticas incompatibles.
- Solo `succeeded` cancela Pedido, SubPedidos y líneas, repone stock una vez, marca Pago `reembolsado`, registra auditoría y envía confirmación.
- `failed` o `canceled` dejan la solicitud `fallida`, sin alterar Pedido ni stock, y permiten un reintento controlado.

**Posibles errores**
401 sesión ausente · 403 Pedido ajeno · 404 Pedido inexistente o UUID inválido · 409 estado económico/logístico no cancelable · 502 Stripe rechazó o no completó el reembolso · 503 Stripe no disponible · 500 error interno.

**Casos de uso relacionados**
CU-033

**Pantallas relacionadas**
PT-COM-007

**Observaciones**
No sustituye el derecho de desistimiento posterior a la entrega ni el flujo de Incidencias. Implementa CAP-09, LEGAL-07 y DLOG 0027.

---

## Estado de revisión

INF-08 v2.6 queda **APROBADO POR EL CTO CON AUTORIZACIÓN DEL CEO** con 51 operaciones y 11 módulos. Añade exclusivamente API-051 y las precisiones de condiciones de envío de API-006/API-030/API-031, sin cambiar arquitectura, roles, comisión, pago o alcance comercial.
