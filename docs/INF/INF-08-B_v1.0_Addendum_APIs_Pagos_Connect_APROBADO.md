# INF-08-B v1.0 — Addendum de APIs de pagos Stripe Connect

**Estado:** APROBADO POR EL CEO · 24/07/2026  
**Dependencias:** DLOG 0030, INF-06-C v1.0, INF-08 v2.6  
**Contrato ejecutable:** `docs/INF/openapi/teralya-openapi-v1.1.yaml` v1.2.0

Este addendum amplía la superficie normativa de 51 a 56 operaciones. No modifica los códigos API-001 a API-051.

## API-052 — Iniciar o continuar onboarding Stripe Connect

- **Método y ruta:** `POST /bodegas/yo/stripe-connect/onboarding`
- **Actor:** Bodega autenticada, aprobada o activa.
- **Resultado:** estado sincronizado, URL alojada por Stripe y expiración.
- **Idempotencia:** una única cuenta Express por Bodega; los reintentos recuperan la cuenta existente.
- **Errores:** `401`, `403`, `404`, `409`, `502`, `503`.

## API-053 — Consultar estado Stripe Connect

- **Método y ruta:** `GET /bodegas/yo/stripe-connect`
- **Actor:** Bodega autenticada.
- **Resultado:** estado, verificación, capacidad de cargos, capacidad de cobros y `puede_cobrar`.
- **Autoridad:** Stripe; cada consulta sincroniza el estado persistido cuando ya existe una cuenta.

## API-054 — Consultar justificante del Comprador

- **Método y ruta:** `GET /pedidos/{id}/justificante`
- **Actor:** Comprador propietario del Pedido.
- **Resultado:** documento correlativo `REC`, snapshots e importes.
- **Leyenda obligatoria:** no es factura de compra del vino; la factura corresponde a la Bodega vendedora.

## API-055 — Consultar liquidación de Bodega

- **Método y ruta:** `GET /bodegas/yo/subpedidos/{id}/liquidacion`
- **Actor:** Bodega propietaria del SubPedido.
- **Resultado:** documento correlativo `LIQ` con vino bruto, descuentos, vino neto, transporte, impuestos, comisión e importe para la Bodega.

## API-056 — Consultar factura de comisión

- **Método y ruta:** `GET /bodegas/yo/subpedidos/{id}/factura-comision`
- **Actor:** Bodega propietaria del SubPedido.
- **Resultado:** documento correlativo `FAC` con la comisión de intermediación.
- **Gate fiscal:** no puede considerarse factura fiscal final en producción mientras falten datos fiscales verificados o la validación tributaria externa.

## Precisiones a operaciones existentes

### API-017

No crea una sesión de Checkout si alguna Bodega incluida carece de cuenta Stripe Connect `activa`, verificada y habilitada para cargos y cobros. Devuelve `409`.

### API-029

Después de validar el evento pagado:

1. distribuye descuentos, transporte e impuestos entre Bodegas de forma determinista;
2. calcula la comisión sobre vino neto de descuentos;
3. crea un ledger de transferencia por SubPedido;
4. genera justificante, liquidaciones y documentos de comisión;
5. transfiere a cada cuenta Stripe Connect con idempotencia;
6. solo completa `pago.total_repartido` cuando todas las transferencias han sido confirmadas.

Un error transitorio de Stripe devuelve `502` o `503` y permite repetir el webhook sin duplicar transferencia.

### API-051

Antes del reembolso del cargo, revierte idempotentemente cada transferencia Stripe confirmada. La cancelación comercial y la reposición de stock conservan las garantías ya aprobadas.
