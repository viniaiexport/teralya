# LEGAL-08 — Política de Reembolsos e Incidencias

**Teralya · Versión 1.0 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual, alineado con el modelo de datos de Incidencia ya aprobado (INF-05/INF-06/CAP-06) y con LEGAL-07. Aprobado para publicación por el CEO (Decision Log 0024).

---

## 1. Cuándo procede un reembolso

- Desistimiento dentro de los 14 días (LEGAL-07 §1).
- Cancelación del pedido antes del envío (LEGAL-07 §3).
- El pago se confirmó pero el stock ya no estaba disponible: el webhook de Stripe revierte la operación de forma atómica y no permite stock negativo; el importe correspondiente se reembolsa automáticamente.
- Una incidencia (vino dañado, pedido incompleto, error de la Bodega) resuelta a favor del Comprador tras su revisión por administración.

## 2. Cómo se gestiona una incidencia

Cada incidencia sigue el ciclo cerrado ya aprobado en el modelo de datos: **abierta → en_revision → resuelta → cerrada**, sin reaperturas ni soporte avanzado en el MVP (Decision Log 0015). Solo la administración de Teralya gestiona el cambio de estado de una incidencia; cada cambio queda auditado.

1. El Comprador (o la Bodega) reporta la incidencia asociada a un pedido, subpedido, bodega o vino concreto.
2. Administración la revisa (`en_revision`) y decide la resolución: reembolso total, parcial, reposición o desestimación motivada.
3. La incidencia pasa a `resuelta` cuando se aplica la decisión, y a `cerrada` cuando se confirma que no requiere más acción.

## 3. Plazos y forma del reembolso

- El reembolso se procesa mediante Stripe, devolviendo el importe al mismo medio de pago utilizado.
- *[Plazo concreto de procesamiento pendiente de fijar con Infraestructura/Legal antes de producción; orientativo, no más de 14 días desde la resolución, conforme al estándar de la Directiva 2011/83/UE para desistimiento.]*
- En pedidos con varias Bodegas (varios SubPedidos), el reembolso se calcula y aplica por SubPedido, no de forma global, salvo que la incidencia afecte al pedido completo.

## 4. Responsabilidad de cada parte

- La **Bodega** es responsable de la calidad, el etiquetado y el estado del vino en el momento del envío, y de gestionar físicamente cualquier devolución.
- **Teralya** es responsable de que el flujo de pago, reembolso e incidencias funcione correctamente y de forma auditable, como intermediario tecnológico.
- El **Comprador** debe reportar cualquier incidencia con diligencia razonable tras recibir el pedido.

## 5. Qué no cubre esta política

No cubre daños indirectos ni compensaciones más allá del importe pagado por el producto y, cuando proceda, el envío, salvo que la normativa de protección al consumidor exija otra cosa.

---

*Pendiente de revisión por un abogado especializado en protección al consumidor de la UE antes de producción real, y de fijar el plazo concreto de procesamiento del reembolso.*
