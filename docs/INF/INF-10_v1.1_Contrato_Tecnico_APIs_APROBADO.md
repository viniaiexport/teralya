# INF-10 — Contrato Técnico de APIs

## Portada

- **Proyecto:** Teralya
- **Versión:** 1.1
- **Estado:** APROBADO POR EL CTO CON AUTORIZACIÓN DEL CEO
- **Fecha:** 17/07/2026
- **Contrato wire:** `docs/INF/openapi/teralya-openapi-v1.1.yaml`

## Control de versiones

| Versión | Fecha | Estado | Descripción |
|---|---|---|---|
| 1.0 | 13/07/2026 | Sustituida | Contrato exacto API-001→050. |
| 1.1 | 17/07/2026 | Aprobada | Añade API-051 y las proyecciones logísticas de Bodega; 51 operaciones, 42 rutas, 11 módulos y 76 schemas. |

## 1. Alcance normativo

INF-10 v1.1 conserva íntegramente las reglas de INF-10 v1.0 para API-001→050 salvo las precisiones expresas de este documento. El YAML OpenAPI v1.1 es la fuente normativa de requests, responses, errores, límites y seguridad.

No se modifica el framework, la topología, la comisión, el modelo vendedor, la moneda, la sesión, la matriz logística ni el resto del alcance del MVP.

## 2. Fuentes

- CAP-09 v1.0.
- INF-05 v1.5 y migración `20260717_001_cierre_web.sql`.
- INF-06 v1.3 + INF-06-B v1.0.
- INF-08 v2.6.
- INF-09 v1.1.
- INF-10-A v1.1.
- LEGAL-07 v1.1 y LEGAL-09 v1.2.
- DLOG 0027–0029.

## 3. Superficie aprobada

- **51** operaciones método–ruta.
- **42** rutas.
- **11** módulos.
- **76** schemas.
- API-001→050 mantienen su código y ruta.
- API-051: `POST /pedidos/{id}/cancelacion`.

Distribución: Autenticación 4 · Bodegas 4 · Vinos 7 · Carrito 5 · Checkout 3 · Pedidos 3 · SubPedidos 3 · Administración 13 · Sistema 1 · Direcciones 4 · Imágenes 4.

## 4. Operaciones modificadas o añadidas

| API | Método y ruta | Cambio v1.1 |
|---|---|---|
| API-006 | `PATCH /bodegas/yo/perfil` | Admite campos logísticos públicos y devuelve BodegaSelf actualizado. |
| API-020 | `GET /pedidos/{id}` | Añade `puede_cancelar` y resumen opcional `cancelacion`; no expone SubPedidos ni referencias Stripe. |
| API-030 | `GET /bodegas/{id}` | Publica exclusivamente las condiciones logísticas autorizadas. |
| API-031 | `GET /bodegas/yo/perfil` | Devuelve los mismos campos logísticos editables. |
| API-051 | `POST /pedidos/{id}/cancelacion` | Solicita cancelación y reembolso completo idempotente. |

## 5. API-051

### Request

- Path `id`: UUID obligatorio.
- Sin body funcional.
- Seguridad: `BearerOpaque`.
- Actor: Comprador propietario del Pedido.

### Response 200

`OrderCancellationResult`:

- `pedido_id: UUID`.
- `pedido_estado: OrderState`.
- `pago_estado: pagado | reembolsado`.
- `estado: procesando | completada | fallida`.
- `reembolso_estado?: pending | requires_action | succeeded | failed | canceled`.
- `solicitada_at: DateTime`.
- `completada_at?: DateTime`.

### Errores

- `401` sesión ausente o inválida.
- `403` Pedido ajeno.
- `404` Pedido inexistente o UUID inválido.
- `409` Pedido, Pago o logística no cancelables.
- `502` Stripe rechazó/no completó el reembolso.
- `503` Stripe no disponible.
- `500` error interno no clasificable.

## 6. Idempotencia y consistencia económica

- Una fila `cancelacion_pedido` por Pedido.
- Bloqueo transaccional de Pedido, Pago y ledger antes de decidir.
- Clave Stripe: `teralya-cancelacion-{pedido_id}-{intento}`.
- Reintentos concurrentes del mismo intento reutilizan el mismo efecto Stripe.
- `pending`/`requires_action` no cambian Pedido, Pago, líneas ni stock.
- `succeeded` aplica todos los efectos comerciales en una única transacción.
- `failed`/`canceled` no modifican stock ni estados comerciales y permiten un intento posterior.
- Una cancelación completada se devuelve como replay sin duplicar reembolso, stock, auditoría ni email.
- Mientras el ledger está `procesando`, API-023 no permite una transición logística incompatible.

## 7. Proyecciones de Bodega

Campos logísticos autorizados:

- `paises_envio: string[]`.
- `plazo_preparacion_dias: integer`.
- `plazo_entrega_estimado: string`.
- `coste_envio_descripcion: string`.
- `transportista_habitual: string`.
- `restricciones_entrega: string`.
- `condiciones_empaquetado: string`.
- `capacidad_internacional: boolean`.

API-030 nunca expone comisión, documentación de verificación, IDs internos de aprobación, auditoría, credenciales ni observaciones internas.

## 8. Reglas wire conservadas

- OpenAPI 3.1 y JSON Schema 2020-12.
- JSON UTF-8.
- Dinero como string decimal y EUR como única moneda.
- `application/problem+json` con `X-Request-Id`.
- Bearer opaco, sin declarar JWT.
- Schemas cerrados mediante `additionalProperties: false` cuando procede.
- Paginación `page/page_size` 1/20/100.

## 9. Validación de aprobación

- Generador reproducible: `scripts/generate_openapi_contract.py`.
- Validador de superficie: `scripts/validate_openapi_contract.py`.
- Redocly: válido.
- Test backend: 42 rutas, 51 operaciones y códigos únicos API-001→051.

INF-10 v1.1 queda aprobado. Cualquier nueva ruta exige trazabilidad CAP, actualización coordinada de INF-08/INF-10/INF-10-A/OpenAPI y autorización del CEO cuando altere alcance o negocio.
