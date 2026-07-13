# INF-10 — Contrato Técnico de APIs

## Portada

- **Proyecto:** Teralya
- **Documento:** INF-10 — Contrato Técnico de APIs
- **Versión:** 1.0
- **Estado:** EN REVISIÓN
- **Fecha:** 13/07/2026
- **Responsable:** CTO Teralya
- **Artefacto wire previsto:** OpenAPI 3.1

## Control de versiones

| Versión | Fecha | Autor | Estado | Descripción |
|---|---|---|---|---|
| 1.0 | 13/07/2026 | CTO + preparación técnica | EN REVISIÓN | Define gobernanza, invariantes, cierre TAPI-01→09 y matriz exacta; YAML OpenAPI todavía pendiente de generación y validación. |

## Objetivo

Convertir INF-08 v2.5 en un contrato técnico implementable de requests, responses, errores y enumeraciones sin modificar las funcionalidades del MVP ni la arquitectura. API-001 a API-042 conservan códigos, métodos y rutas; API-043 a API-050 formalizan Direcciones e Imágenes conforme a DLOG 0019.

INF-08 v2.5 y CAP-08 v1.4 están EN REVISIÓN como correcciones coordinadas autorizadas por DLOG 0020. INF-10 definirá el contrato wire. El futuro YAML OpenAPI será la fuente normativa de schemas y no se duplicarán sus definiciones completas en este Markdown.

## Fuentes normativas

- INF-05 v1.4 — esquema aprobado.
- INF-06 v1.3 — diccionario aprobado.
- INF-08 v2.5 — 50 contratos funcionales EN REVISIÓN.
- CAP-02 v1.3 aprobado y CAP-08 v1.4 EN REVISIÓN.
- ADR-001 y ADR-002.
- DLOG 0014 a 0020.
- INF-07 v1.3 e INF-09 v1.0 únicamente para coherencia; no se reabren.

## Artefactos coordinados

1. `docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_EN_REVISION.md`: gobernanza, decisiones e informe de cobertura.
2. `docs/INF/openapi/teralya-openapi-v1.0_EN_REVISION.yaml`: futuro contrato OpenAPI 3.1, creado únicamente tras cerrar los bloqueos de este documento.

## Invariantes no negociables

- Exactamente 50 pares método–ruta y once módulos.
- Cero rutas o funcionalidades nuevas sin autorización y trazabilidad previa.
- Cada operación conservará `operationId` o extensión `x-teralya-api-code` con su código API.
- API-035 y API-037 se representarán como paths sin query embebida y parámetro `estado`.
- No se afirmará JWT ni otro formato de token no aprobado.
- Los DTO no expondrán tablas completas por defecto.
- Solo se publicarán enums usados por el contrato.
- No se añadirá una cabecera global `Idempotency-Key`; se conservarán las reglas específicas de API-011, API-016, API-017 y API-029. API-043 usa `Idempotency-Key` UUID y API-047/API-048 usan `upload_id` UUID como reglas locales.
- API-029 mantendrá `/sistema/webhooks/stripe` y `Stripe-Signature`.
- El contrato OpenAPI no se aprobará mientras exista una dependencia obligatoria sin operación o entrada implementable.

## Matriz bloqueada de operaciones

| Código | Módulo | Método | Ruta funcional | Actor |
|---|---|---|---|---|
| API-001 | Autenticación | POST | `/auth/registro/comprador` | Público |
| API-002 | Autenticación | POST | `/auth/login` | Público |
| API-003 | Autenticación | POST | `/auth/recuperar-password` | Público |
| API-004 | Autenticación | POST | `/auth/restablecer-password` | Público |
| API-005 | Bodegas | POST | `/bodegas` | Bodega no registrada |
| API-006 | Bodegas | PATCH | `/bodegas/yo/perfil` | Bodega |
| API-007 | Vinos | POST | `/bodegas/yo/vinos` | Bodega |
| API-008 | Vinos | PUT | `/bodegas/yo/vinos/{id}` | Bodega |
| API-009 | Vinos | GET | `/vinos` | Visitante, Comprador |
| API-010 | Vinos | GET | `/vinos/{id}` | Visitante, Comprador |
| API-011 | Carrito | POST | `/carrito/items` | Comprador |
| API-012 | Carrito | GET | `/carrito` | Comprador |
| API-013 | Carrito | PATCH | `/carrito/items/{id}` | Comprador |
| API-014 | Carrito | DELETE | `/carrito/items/{id}` | Comprador |
| API-015 | Carrito | DELETE | `/carrito` | Comprador |
| API-016 | Checkout | POST | `/checkout` | Comprador |
| API-017 | Checkout | POST | `/checkout/pago` | Comprador |
| API-018 | Checkout | GET | `/checkout/confirmacion/{pedido_id}` | Comprador |
| API-019 | Pedidos | GET | `/pedidos` | Comprador |
| API-020 | Pedidos | GET | `/pedidos/{id}` | Comprador |
| API-021 | SubPedidos | GET | `/bodegas/yo/subpedidos` | Bodega |
| API-022 | SubPedidos | GET | `/bodegas/yo/subpedidos/{id}` | Bodega |
| API-023 | SubPedidos | PATCH | `/bodegas/yo/subpedidos/{id}/estado` | Bodega |
| API-024 | Administración | POST | `/admin/bodegas/{id}/validar` | Administrador |
| API-025 | Administración | POST | `/admin/vinos/{id}/publicar` | Administrador |
| API-026 | Administración | POST | `/admin/vinos/{id}/despublicar` | Administrador |
| API-027 | Administración | GET | `/admin/pedidos` | Administrador |
| API-028 | Administración | GET | `/admin/dashboard` | Administrador |
| API-029 | Sistema | POST | `/sistema/webhooks/stripe` | Stripe mediante firma verificada |
| API-030 | Bodegas | GET | `/bodegas/{id}` | Visitante, Comprador |
| API-031 | Bodegas | GET | `/bodegas/yo/perfil` | Bodega |
| API-032 | Vinos | GET | `/bodegas/yo/vinos` | Bodega |
| API-033 | Vinos | GET | `/bodegas/yo/vinos/{id}` | Bodega |
| API-034 | Vinos | POST | `/bodegas/yo/vinos/{id}/solicitar-publicacion` | Bodega |
| API-035 | Administración | GET | `/admin/bodegas?estado=pendiente` | Administrador |
| API-036 | Administración | GET | `/admin/bodegas/{id}` | Administrador |
| API-037 | Administración | GET | `/admin/vinos?estado=pendiente_revision` | Administrador |
| API-038 | Administración | GET | `/admin/vinos/{id}` | Administrador |
| API-039 | Administración | GET | `/admin/pedidos/{id}` | Administrador |
| API-040 | Administración | GET | `/admin/incidencias` | Administrador |
| API-041 | Administración | GET | `/admin/incidencias/{id}` | Administrador |
| API-042 | Administración | PATCH | `/admin/incidencias/{id}` | Administrador |
| API-043 | Direcciones | POST | `/direcciones` | Comprador, Bodega validada |
| API-044 | Direcciones | GET | `/direcciones` | Comprador, Bodega validada |
| API-045 | Direcciones | PATCH | `/direcciones/{id}` | Comprador, Bodega validada |
| API-046 | Direcciones | DELETE | `/direcciones/{id}` | Comprador, Bodega validada |
| API-047 | Imágenes | POST | `/bodegas/yo/vinos/{id}/imagenes/upload-url` | Bodega validada |
| API-048 | Imágenes | POST | `/bodegas/yo/vinos/{id}/imagenes` | Bodega validada |
| API-049 | Imágenes | PATCH | `/bodegas/yo/vinos/{id}/imagenes/{imagen_id}` | Bodega validada |
| API-050 | Imágenes | DELETE | `/bodegas/yo/vinos/{id}/imagenes/{imagen_id}` | Bodega validada |

**Distribución verificada:** Autenticación 4 · Bodegas 4 · Vinos 7 · Carrito 5 · Checkout 3 · Pedidos 2 · SubPedidos 3 · Administración 13 · Sistema 1 · Direcciones 4 · Imágenes 4 = **50**.

## Convenciones técnicas propuestas

Estas convenciones pueden incorporarse al YAML después de su aprobación técnica:

- JSON UTF-8 para requests y responses de negocio.
- UUID con `format: uuid`; fechas con `format: date-time`.
- Seguridad autenticada mediante esquema HTTP Bearer abstracto, sin declarar que el token sea JWT.
- Dinero serializado como string decimal con dos posiciones para evitar pérdida binaria.
- Error común: `{ code, message, field_errors?, request_id }`.
- Paginación MVP: `page` desde 1 y `page_size` con límite máximo explícito.
- Schemas cerrados con `additionalProperties: false` cuando el DTO esté totalmente definido.
- Respuesta paginada con `items`, `page`, `page_size`, `total_items` y `total_pages`.
- Identificadores de error estables y legibles por máquina.

## Idempotencia y atomicidad obligatorias

| Operación | Regla |
|---|---|
| API-011 | Fusión por `fusion_id`, SHA-256 canónico y resultado persistido; reintento idéntico no vuelve a sumar. |
| API-016 | Un carrito origina como máximo un Pedido `pendiente_pago`; el reintento devuelve el mismo. |
| API-017 | Una sola sesión Stripe activa por Pedido; se reutiliza mientras sea válida y puede sustituirse tras expirar. |
| API-029 | Un `stripe_event_id` produce como máximo un efecto comercial exitoso; Pago, stock y SubPedidos se confirman atómicamente. |
| API-043 | `Idempotency-Key` UUID identifica la Dirección; mismo payload devuelve el mismo resultado y payload distinto produce 409. |
| API-047/048 | `upload_id` UUID vincula presignado y confirmación; el objeto se verifica y solo puede registrarse una Imagen activa por confirmación. |

## Decisiones técnicas cerradas antes de generar OpenAPI

| ID | Tema | Decisión | Estado |
|---|---|---|---|
| TAPI-01 | Transporte de sesión | HTTP Bearer opaco de 256 bits, TTL absoluto 8 h, hash SHA-256 en Redis, sin JWT, refresh ni sliding expiration. | RESUELTA — DLOG 0020 |
| TAPI-02 | Dinero | Importes como string decimal compatible con numeric(10,2); EUR única moneda del MVP. | RESUELTA — DLOG 0020 |
| TAPI-03 | Error común | `application/problem+json`, schema Problem cerrado y X-Request-Id en toda respuesta. | RESUELTA — DLOG 0020 |
| TAPI-04 | Paginación | `page=1`, `page_size=20`, máximo 100 y orden estable por recurso. | RESUELTA — DLOG 0020 |
| TAPI-05 | Eventos Stripe | Allowlist de cuatro eventos Checkout Session y efectos exactos por evento. | RESUELTA — DLOG 0020 |
| TAPI-06 | Transiciones de SubPedido | Matriz cerrada, mismo estado idempotente y entregado/cancelado terminales. | RESUELTA — DLOG 0020 |
| TAPI-07 | Direcciones e imágenes | API-043 a API-050; ownership por sesión, carga prefirmada, confirmación verificada y desactivación lógica. | RESUELTA — DLOG 0019 |
| TAPI-08 | Error 402 de API-017 | Se retira 402; API-017 solo crea/reutiliza sesión y usa 409/502/503 según el fallo. | RESUELTA — DLOG 0020 |
| TAPI-09 | Proyecciones DTO | Schemas cerrados, límites comunes, proyecciones públicas/propias/admin y mapeo 50/50. | RESUELTA — DLOG 0020 |

## Resolución de TAPI-07

La brecha queda resuelta funcionalmente mediante DLOG 0019 e INF-08 v2.5:

- API-043 a API-046 crean, consultan, actualizan y desactivan lógicamente Direcciones propias de Comprador o Bodega.
- API-047 y API-048 implementan carga directa prefirmada y confirmación verificada de Imágenes sin transferir binarios por el backend.
- API-049 y API-050 actualizan metadatos y desactivan lógicamente Imágenes, protegiendo la última imagen activa requerida por un vino en revisión o publicado.
- La propiedad siempre se deriva de la sesión. API-001 a API-042 no cambian de código, método ni ruta.
- Los snapshots de dirección se congelan al crear el Pedido `pendiente_pago`; API-029 los conserva y congela líneas y precios al confirmar el pago.

### Parámetros normativos de carga TAPI-07

| Parámetro | Valor |
|---|---|
| MIME admitidos | `image/jpeg`, `image/png`, `image/webp` |
| Tamaño máximo | 10 MiB (10 × 1024 × 1024 bytes) |
| Checksum | SHA-256 en base64; firmado como `x-amz-checksum-sha256` |
| TTL de URL prefirmada | 10 minutos |
| TTL del token de confirmación | 30 minutos |
| Cabeceras firmadas del PUT | `Content-Type`, `x-amz-checksum-sha256`, `If-None-Match: *` |
| Verificación al confirmar | HEAD: clave, Content-Type, Content-Length y checksum deben coincidir exactamente con el token firmado |
| URL persistida | URL CDN estable; nunca la URL prefirmada |

El token de confirmación firmado contiene actor/bodega, `vino_id`, `upload_id`, clave, MIME, bytes, checksum y expiración. `upload_id` se reutiliza como `imagen.id`; la clave de objeto se deriva determinísticamente de bodega, vino y upload_id. Antes de confirmar no se requiere ledger: API-047 puede reemitir para la misma clave; API-048 materializa la unicidad mediante la PK existente y compara el payload canónico para replay o conflicto.

Las promociones de Dirección o Imagen principal se ejecutan en transacción con bloqueo de las filas activas del propietario o vino. La Dirección principal es única por propietario, no por uso. La Imagen principal es única por vino. Las desactivaciones repetidas de recursos propios ya inactivos devuelven 204 sin nuevo efecto.

La solución no añade una capacidad de negocio nueva: hace implementables requisitos de Dirección e Imagen ya presentes en INF-05/INF-06, API-016 y API-025. La generación del OpenAPI sigue condicionada al cierre de TAPI-01 a TAPI-06 y TAPI-08 a TAPI-09 y a la aprobación de INF-08 v2.5.

## Cierre técnico TAPI-01 a TAPI-06 y TAPI-08 a TAPI-09

### TAPI-01 — Sesión opaca

- OpenAPI: `type: http`, `scheme: bearer`; se omite `bearerFormat`.
- Token de 256 bits aleatorios, base64url sin padding, 43 caracteres. Nunca contiene claims ni se persiste en claro.
- TTL absoluto 28.800 segundos; sin refresh ni expiración deslizante. Tras expirar se usa API-002.
- Redis conserva SHA-256 del token, `usuario_id`, `issued_at` y `expires_at` con el mismo TTL.
- API-001/API-002 devuelven `AuthSession {access_token, token_type:"Bearer", expires_in:28800, expires_at, usuario}`.
- Password reset, suspensión/bloqueo/eliminación o pérdida de asociación de bodega revocan sesiones.
- 401 para token ausente, inválido, revocado o expirado con `WWW-Authenticate: Bearer`; 403 para sesión válida sin autorización.
- `Authorization` nunca se registra ni se devuelve fuera de API-001/API-002.

### TAPI-02 — Dinero

- `MoneyAmount`: string `^(0|[1-9][0-9]{0,7})\.[0-9]{2}$`, de 0.00 a 99999999.99.
- `PositiveMoneyAmount`: mismo formato y distinto de 0.00.
- `CurrencyCode`: enum `EUR`; Stripe usa `eur` y el backend normaliza.
- Importes nunca usan JSON number. Porcentajes usan string decimal 0.00–100.00 y no son Money.
- El servidor calcula totales en Decimal o unidades menores enteras; el cliente no envía totales autoritativos.

### TAPI-03 — Error común

Errores con media type `application/problem+json` y schema cerrado:

`Problem {type,title,status,detail,instance?,code,request_id,field_errors?,retryable}`.

- Requeridos: `type`, `title`, `status`, `detail`, `code`, `request_id`, `retryable`.
- `field_errors` contiene como máximo 50 objetos cerrados `{field,code,message}`.
- Toda respuesta incluye `X-Request-Id` UUID; se conserva el del request si es UUID válido.
- Códigos base: `VALIDATION_ERROR` 400; `AUTHENTICATION_REQUIRED`/`INVALID_CREDENTIALS` 401; `FORBIDDEN` 403; `RESOURCE_NOT_FOUND` 404; `CONFLICT`/`IDEMPOTENCY_KEY_REUSED`/`INVALID_STATE_TRANSITION`/`PAYMENT_NOT_READY` 409; `UNSUPPORTED_STRIPE_EVENT` 422; `UPSTREAM_ERROR` 502; `SERVICE_UNAVAILABLE` 503; `INTERNAL_ERROR` 500.
- Nunca se exponen SQL, stack, credenciales, tokens, claves S3, hashes ni payload Stripe íntegro.

### TAPI-04 — Paginación

- Query: `page` integer mínimo 1, default 1; `page_size` integer 1–100, default 20.
- `Page<T> {items,page,page_size,total_items,total_pages}`; página posterior a la última devuelve 200 e items vacío.
- Orden por defecto `created_at DESC,id DESC`; incidencias `fecha DESC,id DESC`; catálogo `fecha_publicacion DESC,id DESC`.
- Aplica a API-009, API-019, API-021, API-027, API-032, API-035, API-037 y API-040. API-044 y API-028 no son paginadas.
- `q` tras trim admite 1–120 caracteres; no hay sort arbitrario ni cursor en el MVP.

### TAPI-05 — Stripe

Allowlist de API-029:

| Evento | Condición | Efecto |
|---|---|---|
| `checkout.session.completed` | `payment_status=paid` | Confirma y ejecuta efecto comercial atómico. |
| `checkout.session.completed` | no pagado | Registra el evento, mantiene Pago pendiente y espera resultado asíncrono. |
| `checkout.session.async_payment_succeeded` | válida | Confirma y ejecuta efecto comercial atómico. |
| `checkout.session.async_payment_failed` | válida | `pago.estado=fallido`; sin stock ni SubPedidos. |
| `checkout.session.expired` | válida | `pago.estado=cancelado`; invalida sesión; sin stock ni SubPedidos. |

- Cualquier otro tipo devuelve 422 sin mutación comercial.
- Se verifica `Stripe-Signature` sobre body crudo con tolerancia máxima 300 s.
- Deben coincidir `event.id`, livemode/entorno, Session ID, metadata `pedido_id`/`pago_id`, `currency=eur` y `amount_total` en céntimos.
- Solo los dos casos de éxito congelan líneas/precios, aplican stock y crean SubPedidos.
- El ledger por `stripe_event_id` hace idempotente el replay; no se admite `payment_intent.payment_failed`.

### TAPI-06 — Matriz de SubPedido

| Origen | Destinos permitidos |
|---|---|
| `pendiente` | `aceptado`, `cancelado`, `incidencia` |
| `aceptado` | `en_preparacion`, `cancelado`, `incidencia` |
| `en_preparacion` | `enviado`, `cancelado`, `incidencia` |
| `incidencia` | `en_preparacion`, `cancelado` |
| `enviado` | `entregado` |
| `entregado` | ninguno; terminal |
| `cancelado` | ninguno; terminal |

Mismo estado devuelve 200 sin nueva mutación. Otro salto devuelve 409. API-023 bloquea Pedido y todos sus SubPedidos; cambio y recálculo DLOG 0018 son atómicos. Las incidencias posteriores al envío viven en la entidad Incidencia y no retroceden logística.

### TAPI-08 — API-017

- Request `{pedido_id:uuid}`.
- 200 `CheckoutSession {pedido_id,checkout_url,session_expires_at,reused}`.
- Reutiliza la sesión activa; si expiró, crea bajo bloqueo como máximo una sustituta.
- Errores: 400 request; 401 sesión; 404 Pedido inexistente/ajeno; 409 Pedido no pendiente, total/moneda o relación incoherentes; 502 respuesta inválida de Stripe; 503 timeout/indisponibilidad.
- No existe 402. El retorno del navegador no confirma y los resultados económicos entran por API-029.

### TAPI-09 — DTO y límites

Límites comunes: email 3–254; password input 12–128; nombre/apellidos 1–100; teléfono 1–32; URL máximo 2048; etiqueta 1–160; texto corto máximo 500; texto largo máximo 5000; arrays máximo 20 e ítem máximo 100; cantidad 1–999; stock 0–999999; año 1800–2100; idiomas `es|en|fr|de|it`. Strings se recortan salvo password; no se admite HTML.

Todos los schemas usan `additionalProperties:false`. Se excluyen hashes, intentos, comisión interna, secretos/IDs Stripe privados, auditoría, documentación/verificación interna y owner IDs derivados.

| Grupo API | DTO de éxito |
|---|---|
| 001–002 | `AuthSession`; usuario de sesión sin secretos |
| 003–004 | `GenericRecoveryAck` / `GenericAck` |
| 005–006, 031 | `BodegaSelf` |
| 024, 035–036 | `BodegaAdmin` / `Page<BodegaAdminSummary>` |
| 030 | `BodegaPublic` |
| 007–008, 033–034 | `WineOwnDetail` |
| 009–010 | `Page<WineSummary>` / `WinePublicDetail` |
| 025–026, 032, 037–038 | proyección own/admin correspondiente |
| 011–015 | `Cart` y resultado de fusión por línea cuando aplica |
| 016–018 | `OrderPrepared`, `CheckoutSession`, `OrderConfirmation` |
| 019–020, 027, 039 | `Page<OrderSummary>` / `OrderDetail` proyectado por rol |
| 021–023 | `Page<SubOrderSummary>` / `SubOrderDetail` |
| 028 | `Dashboard {ventas_dia,pedidos_pendientes}` |
| 029 | `WebhookAck {event_id,status,pedido_id?,pago_estado?,pedido_estado?}` |
| 040–042 | `Page<IncidentSummary>` / `IncidentDetail` |
| 043–046 | `Address`, lista o 204; sin propietario IDs |
| 047–050 | `UploadAuthorization`, `Image` o 204 |

Requests mínimos: registro comprador conserva fecha de nacimiento y dos aceptaciones; registro bodega exige nombre comercial, razón social, CIF/VAT, email, password, persona de contacto, teléfono y aceptación; `WineWrite` exige nombre, precio positivo, EUR, stock y disponibilidad; publicación exige además stock positivo y una imagen confirmada/activa con alt. El catálogo admite `q,tipo_vino,region,denominacion_origen,precio_min,precio_max,page,page_size`.

Proyecciones públicas nunca muestran stock exacto, comisiones, verificación, credenciales, Stripe, auditoría ni direcciones privadas. Proyecciones propias/admin solo añaden campos necesarios por operación. Los campos completos de cada schema se materializarán una sola vez en el YAML y este Markdown conservará la matriz normativa.

## Gate de aprobación

INF-10 v1.0 y su OpenAPI solo serán aprobables cuando:

1. TAPI-01 a TAPI-09 estén cerradas. **CUMPLIDO por DLOG 0019/0020.**
2. INF-08 v2.5 y CAP-08 v1.4 estén aprobados tras revisión binaria; CAP-07 v1.3 permanece vigente. **PENDIENTE.**
3. El YAML sea válido y todos los `$ref` se resuelvan.
4. Existan exactamente las operaciones autorizadas, sin duplicados.
5. Cada operación tenga seguridad, parámetros, request, éxito, errores, ejemplos y trazabilidad.
6. Los enums expuestos coincidan con INF-05/INF-06.
7. Se validen ejemplos positivos y negativos.
8. Los dos subagentes emitan dictamen binario APROBABLE.

## Estado

INF-10 v1.0 queda **EN REVISIÓN** con TAPI-01 a TAPI-09 cerradas documentalmente y 50 operaciones fijadas. Antes de generar el OpenAPI deben aprobarse CAP-08 v1.4 e INF-08 v2.5 mediante dictamen binario; después se generará y validará el YAML contra este contrato.
