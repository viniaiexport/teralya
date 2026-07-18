# INF-06-B — Addendum al Diccionario de Datos: cierre web

**Teralya · Versión 1.0 · 17/07/2026 · Estado: APROBADO POR EL CTO**

## 1. Alcance

Este addendum extiende INF-06 v1.3 para documentar exactamente las diferencias introducidas por `teralya_schema_v1.5_APROBADO.sql`. INF-06 v1.3 continúa siendo normativo para los elementos no modificados.

## 2. Nuevo ENUM

### `estado_cancelacion_pedido`

| Valor | Significado |
|---|---|
| `procesando` | Stripe todavía no ha confirmado el resultado final del reembolso. |
| `completada` | El reembolso se confirmó y la cancelación comercial se aplicó. |
| `fallida` | Stripe devolvió un estado fallido/cancelado o el intento debe repetirse. |

## 3. Campos añadidos a `bodega`

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---:|---|---|
| `plazo_entrega_estimado` | `text` | No | `NULL` | Descripción pública del intervalo estimado de entrega. |
| `coste_envio_descripcion` | `text` | No | `NULL` | Explicación pública del cálculo o condiciones del coste. |
| `restricciones_entrega` | `text` | No | `NULL` | Restricciones declaradas por la Bodega. |
| `condiciones_empaquetado` | `text` | No | `NULL` | Condiciones declaradas de embalaje y protección. |

Los campos preexistentes `paises_envio`, `plazo_preparacion_dias`, `transportista_habitual` y `capacidad_internacional` pasan a formar parte de la proyección logística editable y pública autorizada.

## 4. Nueva tabla `cancelacion_pedido`

**Objetivo.** Ledger único por Pedido para coordinar cancelación contractual, reembolso Stripe, reintentos y prevención de dobles efectos comerciales.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---:|---|---|
| `id` | `uuid` | Sí | `gen_random_uuid()` | Identificador de la solicitud. |
| `pedido_id` | `uuid` | Sí | — | Pedido afectado; único. |
| `pago_id` | `uuid` | Sí | — | Pago del mismo Pedido. |
| `usuario_id` | `uuid` | Sí | — | Comprador que solicita la cancelación. |
| `estado` | `estado_cancelacion_pedido` | Sí | `procesando` | Estado interno del flujo. |
| `importe` | `numeric(10,2)` | Sí | — | Importe completo solicitado a reembolso. |
| `stripe_refund_id` | `text` | No | `NULL` | Identificador único del reembolso Stripe. |
| `stripe_refund_status` | `text` | No | `NULL` | `pending`, `requires_action`, `succeeded`, `failed` o `canceled`. |
| `intentos` | `integer` | Sí | `1` | Número de intento económico. |
| `ultimo_error` | `text` | No | `NULL` | Descripción técnica no expuesta públicamente. |
| `solicitada_at` | `timestamptz` | Sí | `now()` | Inicio de la primera solicitud. |
| `completada_at` | `timestamptz` | No | `NULL` | Confirmación final satisfactoria. |
| `updated_at` | `timestamptz` | Sí | `now()` | Última actualización. |

## 5. Claves y restricciones

- PK: `cancelacion_pedido(id)`.
- Unicidad: `pedido_id` y `stripe_refund_id`.
- FK: `pedido_id → pedido(id)`.
- FK: `usuario_id → usuario(id)`.
- FK compuesta: `(pago_id, pedido_id) → pago(id, pedido_id)`.
- `importe >= 0`.
- `intentos >= 1`.
- `completada_at >= solicitada_at` cuando existe.
- Una cancelación `completada` exige `stripe_refund_status = succeeded`.

## 6. Índices

- `idx_cancelacion_pedido_pago_id` sobre `pago_id`.
- `idx_cancelacion_pedido_estado` sobre `estado`.

## 7. Invariantes transaccionales

- El Pedido, Pago y la solicitud se bloquean antes de decidir.
- Un Pedido produce como máximo una fila `cancelacion_pedido`.
- Cada intento usa una clave Stripe determinista por Pedido e intento.
- El stock no se restituye hasta `succeeded`.
- La restitución se ejecuta únicamente sobre líneas `normal` y una sola vez.
- Un estado `procesando` bloquea transiciones logísticas que podrían hacer irreversible la cancelación.
- API-020 no expone la tabla ni sus campos internos; solo la proyección pública autorizada.
- La notificación de API-051 se reclama mediante una clave única `(pedido_id, evento_origen)` para evitar duplicados concurrentes y permitir reintento controlado si el envío falla.

## 8. Migración

La transición desde INF-05 v1.4 se realiza mediante `database/migrations/20260717_001_cierre_web.sql`, idempotente y ejecutada antes de arrancar nuevas imágenes de aplicación.
