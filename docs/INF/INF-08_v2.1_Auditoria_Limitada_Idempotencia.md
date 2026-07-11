# INF-08 v2.1 — Auditoría limitada de idempotencia

**Teralya · Versión 1.0 · Julio 2026 · Estado: EN REVISIÓN**

## 1. Alcance

Auditoría limitada exclusivamente a la corrección autorizada de idempotencia en API-016 y API-017 de INF-08 v2.1. No reabre ni modifica el resto de la auditoría de INF-08 v2.0.

## 2. Fuentes revisadas

- INF-08 v2.0 aprobada.
- INF-08 v2.1 en revisión.
- API-016 — Realizar checkout.
- API-017 — Pagar Pedido.
- API-029 — Webhook de Stripe.

## 3. Cambio verificado en API-016

- Un carrito activo solo puede originar un Pedido en estado `pendiente_pago`.
- La repetición de la misma solicitud devuelve el Pedido existente.
- No se genera un segundo Pedido por reintento o doble clic.

**Resultado:** CORRECTO.

## 4. Cambio verificado en API-017

- Solo puede existir una sesión activa de Stripe Checkout por Pedido.
- Un reintento reutiliza la sesión activa.
- La operación queda vinculada a `pedido_id` y devuelve la misma URL mientras la sesión siga siendo válida.

**Resultado:** CORRECTO.

## 5. Coherencia con API-029

API-029 continúa siendo la fuente definitiva del estado del pago y mantiene procesamiento idempotente del webhook. Los cambios de API-016 y API-017 previenen duplicidades antes de la confirmación de Stripe y no alteran la autoridad de API-029.

**Resultado:** CORRECTO.

## 6. Impacto funcional

No se añade ninguna funcionalidad al MVP. La corrección evita Pedidos y sesiones de Stripe duplicados ante reintentos de red o doble clic.

## 7. Conclusión

INF-08 v2.1 incorpora correctamente la protección de idempotencia autorizada. El resto de INF-08 permanece sin cambios. Documento pendiente de revisión del CTO y aprobación del CEO.
