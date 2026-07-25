# OPS-01 — Gate de pagos Stripe Connect

**Fecha:** 24/07/2026  
**Estado:** IMPLEMENTADO EN RAMA; ACTIVACIÓN LIVE BLOQUEADA

## Implementado

- onboarding Express para Bodegas;
- bloqueo de checkout sin cuenta operativa;
- cobro único y reparto por SubPedido;
- comisión calculada sobre vino neto de descuentos;
- transporte íntegro para la Bodega;
- ledger de transferencias e idempotencia;
- reversión de transferencias antes del reembolso;
- justificante para Comprador;
- liquidación y documento de comisión para Bodega;
- migración, variables de entorno, rutas privadas y contrato OpenAPI.

## Evidencia exigida en staging

- Bodega A y Bodega B completan onboarding en modo test.
- Un Pedido con ambas Bodegas cobra una sola vez.
- Stripe registra dos transferencias y el total coincide con el 85 % del vino neto más transporte e impuestos atribuibles, salvo excepciones de comisión aprobadas.
- El justificante indica que no es factura de compra.
- Cada Bodega solo puede ver su liquidación y su documento de comisión.
- Repetir el webhook no duplica SubPedidos, stock, documentos ni transferencias.
- Cancelar el Pedido revierte ambas transferencias antes de reembolsar el cargo.

## Bloqueos para live

- datos legales y fiscales completos de Teralya;
- NIF-IVA y domicilio fiscal verificados de cada Bodega;
- dictamen fiscal sobre IVA de la comisión y facturación transfronteriza;
- cuentas Connect de producción completadas por las Bodegas;
- secretos live de Stripe y webhook separados de test;
- desglose definitivo del transporte por Bodega cuando se cierre la decisión de envíos; hasta entonces staging distribuye el total de transporte proporcionalmente al vino de cada SubPedido;
- gate de dependencias cerrado: PostCSS 8.5.23 y Sharp 0.35.3 quedan fijados mediante `overrides`; `npm audit --omit=dev --audit-level=high` devuelve 0 vulnerabilidades;
- aprobación de Seguridad y cierre del resto de gates de OPS-01.

La rama no autoriza despliegue en producción por sí sola.
