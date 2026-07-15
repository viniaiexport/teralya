# LEGAL-07 — Derecho de Desistimiento y Cancelación de Contrato

**Teralya · Versión 1.0 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual, redactado a partir de la Directiva 2011/83/UE y la Directiva (UE) 2023/2673. Aprobado para publicación por el CEO (Decision Log 0024).

**Prioridad de ingeniería:** el apartado 3 (botón de cancelación de contrato) es una obligación **ya en vigor desde el 19 de junio de 2026** y todavía no tiene una implementación en el frontend/backend de Teralya. Este documento cubre el contenido legal; la función correspondiente en Checkout/Pedidos debe priorizarse en el próximo ciclo de desarrollo (FE-008/FE-009).

---

## 1. Derecho de desistimiento (14 días)

El Comprador tiene derecho a desistir de su compra en un plazo de **14 días naturales** desde la recepción del vino, sin necesidad de justificar su decisión, conforme a la Directiva 2011/83/UE.

**El vino de Teralya NO está exento de este derecho.** La excepción de la Directiva para "vino especulativo" (vin en primeur) es muy estrecha: solo cubre vino cuyo valor depende de fluctuaciones de mercado y cuya entrega se difiere significativamente. La venta normal de Teralya (vino con precio fijo y entrega ordinaria) queda fuera de esa excepción y se rige por el derecho de desistimiento general.

## 2. Cómo ejercerlo

- El Comprador comunica su decisión de desistir a través del canal habilitado en su cuenta (`/pedidos`) o al contacto de atención al cliente de Teralya, dentro del plazo de 14 días.
- La Bodega correspondiente gestiona la devolución física del producto; Teralya coordina el reembolso a través de Stripe una vez confirmada la devolución (ver LEGAL-08).
- Los costes de devolución corren a cargo del Comprador salvo que la normativa aplicable o la política de la Bodega indiquen lo contrario.
- Si el vino ha sido abierto, consumido o presenta un uso que exceda la simple comprobación razonable, el derecho de desistimiento puede verse limitado conforme a la normativa aplicable.

## 3. Botón de cancelación de contrato

Conforme a la Directiva (UE) 2023/2673, cualquier venta online en la UE debe ofrecer un **botón de cancelación de contrato**, accesible y de fácil uso, que permita al Comprador cancelar su compra de forma directa desde la plataforma, sin necesidad de llamadas telefónicas ni trámites desproporcionados.

**Requisitos funcionales para la implementación (pendiente de desarrollo):**

- Visible desde el detalle de un pedido o subpedido en `/pedidos`, mientras el pedido esté en un estado cancelable (antes de `enviado`/`entregado`, según la matriz de estados de SubPedido ya aprobada en INF-08).
- Debe confirmar la cancelación de forma clara antes de ejecutarla.
- Debe disparar la reversión del pago (o su reembolso, si ya se cobró) y la actualización del estado de SubPedido a `cancelado`, reutilizando el mismo mecanismo idempotente que ya protege el webhook de Stripe.
- El Comprador debe recibir confirmación por correo electrónico de la cancelación.

## 4. Excepciones al derecho de desistimiento

No se aplican en el modelo actual de Teralya excepciones distintas de las generales del comercio electrónico (bienes personalizados, sellados por razones de higiene, etc.), salvo que una Bodega concreta comercialice un producto que encaje en alguna de ellas — a evaluar caso por caso con asesoría legal si llega a darse.

---

*Pendiente de revisión por un abogado especializado en comercio electrónico/UE antes de producción real. La implementación técnica del botón de cancelación (§3) es una tarea de ingeniería pendiente, ya exigible legalmente.*
