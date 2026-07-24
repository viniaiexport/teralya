# INF-06-C v1.0 — Addendum de pagos, reparto y documentos económicos

**Estado:** APROBADO POR EL CEO · 24/07/2026  
**Dependencias:** DLOG 0030, INF-05 v1.5, INF-06 v1.3, INF-06-B v1.0  
**Implementación:** `database/migrations/20260724_002_pagos_connect_documentos.sql`

## 1. Regla económica

- El Comprador realiza un único pago por vino neto de descuentos, transporte e impuestos.
- La comisión de Teralya se calcula exclusivamente sobre el importe del vino después de descuentos.
- La comisión estándar es el 15 %. Cualquier excepción usa la comisión aprobada y persistida para la Bodega.
- Cada Bodega recibe el vino neto menos la comisión, más el 100 % del transporte y los impuestos que le correspondan.
- Un Pedido multi-bodega genera una transferencia Stripe independiente por SubPedido mediante *separate charges and transfers*.
- Las comisiones propias de Stripe son coste de Teralya y no reducen el importe contractual de la Bodega.

## 2. Cambios de datos

### `subpedido.descuentos`

`NUMERIC(10,2) NOT NULL DEFAULT 0`. Conserva la parte proporcional de los descuentos del Pedido asignada al SubPedido antes de calcular la comisión.

### `transferencia_stripe`

Ledger económico de una transferencia por SubPedido.

| Campo | Regla |
|---|---|
| `pago_id`, `subpedido_id`, `bodega_id` | Trazabilidad comercial completa |
| `cuenta_stripe_connect_id` | Cuenta de destino verificada al confirmar el cobro |
| `importe`, `moneda` | Importe exacto en EUR |
| `estado` | `pendiente`, `procesando`, `transferida`, `fallida` o `revertida` |
| `stripe_transfer_id` | Identificador único de Stripe |
| `intentos`, `ultimo_error` | Reintento auditable |
| `stripe_reversal_id`, `reversion_estado` | Reversión previa al reembolso del Pedido |

La clave de idempotencia de transferencia se deriva del identificador interno del ledger. Cada transferencia referencia el cargo origen de Checkout (`source_transaction`) para que Stripe la vincule al cobro confirmado. Un estado `procesando` abandonado puede reclamarse tras diez minutos.

### `serie_documental`

Contador correlativo por tipo y ejercicio para:

- `REC`: justificante del Comprador;
- `LIQ`: liquidación de Bodega;
- `FAC`: factura de comisión.

### `documento_economico`

Conserva emisor, receptor e importes como snapshots JSONB inmutables para evitar que cambios posteriores en perfiles alteren documentos históricos.

| Tipo | Destinatario | Naturaleza |
|---|---|---|
| `justificante_cliente` | Comprador | Confirma la transacción del dinero; no es factura de compra |
| `liquidacion_bodega` | Bodega | Desglosa vino, descuentos, transporte, comisión e importe transferido |
| `factura_comision` | Bodega | Documento de la comisión de intermediación cobrada por Teralya |

## 3. Condiciones de producción

La generación técnica no sustituye la validación fiscal. Antes de emitir facturas de comisión en producción deben constar y verificarse:

- razón social, NIF-IVA y domicilio fiscal de Teralya;
- razón social, NIF-IVA y domicilio fiscal de cada Bodega;
- tratamiento de IVA aplicable según país y condición fiscal de la Bodega;
- revisión externa de numeración, conservación, rectificación y requisitos de facturación.

Hasta cerrar ese gate, la factura de comisión generada en staging contiene la leyenda `pendiente_validacion_fiscal_externa` y no autoriza facturación real.

## 4. Integridad y reembolsos

- API-017 bloquea el checkout si alguna Bodega del Pedido no tiene Stripe Connect operativo.
- API-029 materializa SubPedidos, ledgers y documentos en la misma transacción que confirma el pago.
- Las transferencias se ejecutan con claves idempotentes y actualizan `pago.total_repartido` únicamente cuando todas quedan confirmadas.
- API-051 revierte primero todas las transferencias ya realizadas y después solicita el reembolso del cargo al Comprador.
- Al confirmarse el reembolso, `pago.total_repartido` vuelve a cero y los documentos económicos asociados quedan anulados, conservando la trazabilidad histórica.
- La activación en modo live exige una prueba multi-bodega, una prueba de reintento y una prueba completa de reversión.
