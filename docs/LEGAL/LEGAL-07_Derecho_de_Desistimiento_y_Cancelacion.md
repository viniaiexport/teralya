# LEGAL-07 — Derecho de Desistimiento y Cancelación de Contrato

**Teralya · Versión 1.1 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL · IMPLEMENTACIÓN TÉCNICA CERRADA**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual, redactado a partir de la Directiva 2011/83/UE y la Directiva (UE) 2023/2673. Aprobado para publicación por el CEO (Decision Log 0024).

**Estado de ingeniería:** el apartado 3 está implementado mediante API-051 en PT-COM-007, con confirmación expresa, ledger idempotente, reembolso Stripe, actualización transaccional y notificación. La activación comercial continúa sometida a los gates legales y operativos previos a producción.

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

**Implementación funcional vigente:**

- Visible desde el detalle del Pedido propio en `/pedidos/{id}` cuando API-020 devuelve `puede_cancelar = true`; queda bloqueada si existe expedición, entrega o incidencia logística.
- Exige confirmación expresa antes de ejecutar API-051.
- API-051 coordina el reembolso completo, persiste un único ledger por Pedido y solo aplica cancelación comercial y restitución de stock cuando Stripe confirma el reembolso.
- El Comprador recibe confirmación por correo y puede consultar el estado persistido de la cancelación en PT-COM-007.

## 4. Excepciones al derecho de desistimiento

No se aplican en el modelo actual de Teralya excepciones distintas de las generales del comercio electrónico (bienes personalizados, sellados por razones de higiene, etc.), salvo que una Bodega concreta comercialice un producto que encaje en alguna de ellas — a evaluar caso por caso con asesoría legal si llega a darse.

---

*La implementación técnica del apartado 3 está cerrada. Permanece obligatoria la revisión jurídica especializada y la validación en staging antes de producción real.*
