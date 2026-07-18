# INF-10-A — Catálogo Normativo de DTO

**Versión 1.1 · 17/07/2026 · Estado: APROBADO POR EL CTO**

## 1. Regla de continuidad

INF-10-A v1.0 permanece normativo para los schemas no modificados. Este documento sustituye sus definiciones de `BodegaProfilePatch`, `BodegaPublic`, `BodegaSelf` y `OrderBuyerDetail`, añade los DTO de cancelación y amplía el mapeo a API-051. El YAML OpenAPI v1.1 materializa literalmente el resultado combinado.

## 2. Tipos nuevos

| Tipo | Valores / regla |
|---|---|
| `OrderCancellationState` | `procesando`, `completada`, `fallida` |
| `StripeRefundState` | `pending`, `requires_action`, `succeeded`, `failed`, `canceled` |
| `CountryCode` | string `^[A-Z]{2}$` |
| `CountryCodeList` | array única de 0 a 27 `CountryCode` |

## 3. DTO de Bodega revisados

### `BodegaProfilePatch`

Debe contener al menos un campo. Conserva todos los campos de v1.0 y añade:

| Campo | Tipo | Obligatorio |
|---|---|---:|
| `paises_envio` | `CountryCodeList` | No |
| `plazo_preparacion_dias` | integer 0..365 | No |
| `plazo_entrega_estimado` | string 1..1000 | No |
| `coste_envio_descripcion` | string 1..2000 | No |
| `transportista_habitual` | string 1..160 | No |
| `restricciones_entrega` | string 1..2000 | No |
| `condiciones_empaquetado` | string 1..2000 | No |
| `capacidad_internacional` | boolean | No |

### `BodegaSelf`

Conserva requeridos y opcionales de v1.0 y puede devolver los ocho campos logísticos anteriores. Es una proyección propia; no incluye comisión, verificación interna, credenciales ni auditoría.

### `BodegaPublic`

Conserva requeridos y opcionales de v1.0 y puede devolver los ocho campos logísticos anteriores. `vinos` contiene únicamente vinos publicados y disponibles. No incluye contacto privado, comisión, documentación ni datos internos.

## 4. DTO de Pedido revisado

### `OrderBuyerDetail`

Requeridos:

- todos los campos de `OrderSummary`;
- `puede_cancelar: boolean`;
- `totales: MoneyBreakdown`;
- `direccion_envio_snapshot: AddressSnapshot`;
- `direccion_facturacion_snapshot: AddressSnapshot`;
- `lineas: OrderLine[]`.

Opcional:

- `cancelacion: OrderCancellationSummary`.

Regla cerrada: no contiene SubPedidos, IDs de Stripe, Pago interno, comprador_id, auditoría ni ledger.

## 5. DTO nuevos

### `OrderCancellationSummary`

| Campo | Requerido | Tipo |
|---|---:|---|
| `estado` | Sí | `OrderCancellationState` |
| `solicitada_at` | Sí | `DateTime` |
| `reembolso_estado` | No | `StripeRefundState` |
| `completada_at` | No | `DateTime` |

### `OrderCancellationResult`

Requeridos:

- `pedido_id: UUID`.
- `pedido_estado: OrderState`.
- `pago_estado: pagado | reembolsado`.
- `estado: OrderCancellationState`.
- `solicitada_at: DateTime`.

Opcionales:

- `reembolso_estado: StripeRefundState`.
- `completada_at: DateTime`.

## 6. Mapeo normativo modificado

| API | Request / parámetros | Éxito | Errores |
|---|---|---|---|
| 006 | `BodegaProfilePatch` | 200 `BodegaSelf` | 400,401,403,409,500 |
| 020 | `ResourceIdPath` | 200 `OrderBuyerDetail` | 401,403,404,500 |
| 030 | `ResourceIdPath` | 200 `BodegaPublic` | 404,500 |
| 031 | — | 200 `BodegaSelf` | 401,403,404,500 |
| 051 | `ResourceIdPath`, sin body | 200 `OrderCancellationResult` | 401,403,404,409,500,502,503 |

Las filas API-001→050 no incluidas en esta tabla mantienen el mapeo de INF-10-A v1.0.

## 7. Cierre

El contrato combinado contiene 51 operaciones, 42 rutas y 76 schemas. No queda ninguna propiedad de los DTO modificados delegada a la implementación.
