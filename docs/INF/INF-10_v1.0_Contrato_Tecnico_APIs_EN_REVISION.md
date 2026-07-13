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
| 1.0 | 13/07/2026 | CTO + preparación técnica | EN REVISIÓN | Define gobernanza, invariantes, decisiones pendientes y matriz exacta para generar el contrato OpenAPI implementable. |

## Objetivo

Convertir INF-08 v2.3 en un contrato técnico implementable de requests, responses, errores y enumeraciones sin modificar las funcionalidades del MVP, la arquitectura ni los identificadores funcionales API-001 a API-042.

INF-08 v2.3 continúa siendo la especificación funcional aprobada. INF-10 definirá el contrato wire. El futuro YAML OpenAPI será la fuente normativa de schemas y no se duplicarán sus definiciones completas en este Markdown.

## Fuentes normativas

- INF-05 v1.4 — esquema aprobado.
- INF-06 v1.3 — diccionario aprobado.
- INF-08 v2.3 — 42 contratos funcionales aprobados.
- CAP-02 v1.3 y CAP-08 v1.2.
- ADR-001 y ADR-002.
- DLOG 0014 a 0018.
- INF-07 v1.3 e INF-09 v1.0 únicamente para coherencia; no se reabren.

## Artefactos coordinados

1. `docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_EN_REVISION.md`: gobernanza, decisiones e informe de cobertura.
2. `docs/INF/openapi/teralya-openapi-v1.0_EN_REVISION.yaml`: futuro contrato OpenAPI 3.1, creado únicamente tras cerrar los bloqueos de este documento.

## Invariantes no negociables

- Exactamente 42 pares método–ruta y nueve módulos.
- Cero rutas o funcionalidades nuevas sin autorización y trazabilidad previa.
- Cada operación conservará `operationId` o extensión `x-teralya-api-code` con su código API.
- API-035 y API-037 se representarán como paths sin query embebida y parámetro `estado`.
- No se afirmará JWT ni otro formato de token no aprobado.
- Los DTO no expondrán tablas completas por defecto.
- Solo se publicarán enums usados por el contrato.
- No se añadirá una cabecera global `Idempotency-Key`; se conservarán las reglas específicas de API-011, API-016, API-017 y API-029.
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

**Distribución verificada:** Autenticación 4 · Bodegas 4 · Vinos 7 · Carrito 5 · Checkout 3 · Pedidos 2 · SubPedidos 3 · Administración 13 · Sistema 1 = **42**.

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

## Decisiones necesarias antes de generar OpenAPI

| ID | Tema | Propuesta CTO | Estado |
|---|---|---|---|
| TAPI-01 | Transporte de sesión | HTTP Bearer con token opaco; no afirmar JWT. Expiración/renovación quedan internas hasta decisión posterior. | PROPUESTA |
| TAPI-02 | Formato monetario | String decimal `^[0-9]+\.[0-9]{2}$`, moneda ISO 4217 separada. | PROPUESTA |
| TAPI-03 | Error común | `code`, `message`, `field_errors?`, `request_id`. | PROPUESTA |
| TAPI-04 | Paginación | `page` y `page_size`; fijar límite por defecto y máximo. | PROPUESTA |
| TAPI-05 | Eventos Stripe | Definir allowlist mínima de eventos aceptados por API-029. | PENDIENTE |
| TAPI-06 | Transiciones de SubPedido | Definir matriz exacta entre `pendiente`, `aceptado`, `en_preparacion`, `enviado`, `entregado`, `cancelado` e `incidencia`. | PENDIENTE |
| TAPI-07 | Direcciones e imágenes | Resolver cómo se crean direcciones y se incorporan imágenes sin rutas actuales, dado que API-016 y API-025 las exigen. | BLOQUEO |
| TAPI-08 | Error 402 de API-017 | Aclarar si pertenece a creación de sesión o a un resultado previo del pago. | PENDIENTE |
| TAPI-09 | Proyecciones DTO | Cerrar campos obligatorios y límites de bodega, vino, catálogo y respuestas de detalle sin exponer columnas internas. | PENDIENTE |

## Brecha de implementabilidad TAPI-07

INF-08 v2.3 exige:

- API-016 recibe `direccion_envio_id` y `direccion_facturacion_id`.
- API-025 publica únicamente vinos con al menos una imagen.

Sin embargo, las 42 operaciones aprobadas no contienen una forma explícita de crear/gestionar Direcciones ni de cargar/asociar Imágenes. Un OpenAPI que conserve literalmente las 42 operaciones no puede demostrar cómo se obtienen esos identificadores o precondiciones.

No se añade ninguna ruta en esta versión. La resolución requiere una autorización expresa y, según la alternativa elegida, podría exigir actualizar INF-08 y la matriz de cobertura antes de generar el YAML.

## Alternativas para TAPI-07

| Alternativa | Descripción | Impacto |
|---|---|---|
| A — Operaciones explícitas | Añadir contratos mínimos de Direcciones y de Imágenes. | Más claro y REST; cambia el total de operaciones y exige versionar INF-08. |
| B — Entradas anidadas | Permitir crear direcciones dentro de API-016 e imágenes dentro de API-007/API-008. | Conserva 42 operaciones, pero modifica requests funcionales existentes y mezcla responsabilidades. |
| C — Precondición externa | Declarar que los IDs/Imágenes se obtienen por un proceso fuera de estas APIs. | No implementable end-to-end y contrario al objetivo de INF-10. No recomendada. |

**Recomendación técnica:** Alternativa A. No amplía el objetivo funcional del MVP —Dirección e Imagen ya existen y son obligatorias—, pero sí formaliza operaciones que hoy faltan. Requiere autorización antes de cambiar el contrato funcional.

## Gate de aprobación

INF-10 v1.0 y su OpenAPI solo serán aprobables cuando:

1. TAPI-01 a TAPI-09 estén cerradas.
2. La brecha TAPI-07 esté resuelta en las fuentes funcionales.
3. El YAML sea válido y todos los `$ref` se resuelvan.
4. Existan exactamente las operaciones autorizadas, sin duplicados.
5. Cada operación tenga seguridad, parámetros, request, éxito, errores, ejemplos y trazabilidad.
6. Los enums expuestos coincidan con INF-05/INF-06.
7. Se validen ejemplos positivos y negativos.
8. Los dos subagentes emitan dictamen binario APROBABLE.

## Estado

INF-10 v1.0 queda **EN REVISIÓN**. La matriz de 42 operaciones está fijada, pero la generación del OpenAPI queda bloqueada por TAPI-07 y por las decisiones técnicas pendientes.
