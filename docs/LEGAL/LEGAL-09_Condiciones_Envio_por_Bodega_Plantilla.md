# LEGAL-09 — Plantilla de Condiciones de Envío por Bodega

**Teralya · Versión 1.2 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL · IMPLEMENTACIÓN TÉCNICA CERRADA**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual. No es un documento legal único: es la **plantilla** que cada Bodega debe completar con sus propias condiciones de envío, dentro del marco general de Teralya (LEGAL-03 §1.1 y §4). Aprobado para publicación por el CEO (Decision Log 0024).

**Recordatorio del modelo (Decision Log 0025):** Teralya no compra ni vende vino, no es parte del contrato de compraventa y no actúa como representante fiscal de ninguna Bodega. Cada Bodega decide a qué países vende y desde cuál envía, y es la única responsable de cumplir la normativa de esos países. Lo que ofrece esta plantilla, y lo que Teralya puede sugerir según §2.1, es orientación — nunca asesoría legal ni una garantía de cumplimiento.

---

## 1. Por qué existe esta plantilla

El modelo de negocio de Teralya es de venta directa: cada Bodega gestiona su propio envío (Decision Log, INF-07). Para que el Comprador sepa exactamente qué esperar antes de comprar, cada Bodega debe publicar sus condiciones de envío en su ficha, siguiendo esta estructura mínima común.

## 2. Campos que cada Bodega debe completar

| Campo | Descripción |
|---|---|
| Países de envío | Lista de países a los que la Bodega envía. **Decisión y responsabilidad exclusiva de la Bodega** (LEGAL-01 §2, Decision Log 0025): una Bodega no debe activar el envío a un país donde no tenga cubierta, por sí misma, su obligación de registro/representación fiscal y cualquier otro requisito legal de venta de alcohol. |
| Plazo de preparación | Días hábiles entre la confirmación del pedido y el envío del SubPedido. |
| Plazo de entrega estimado | Días hábiles desde el envío hasta la entrega, por zona o país. |
| Coste de envío | Importe fijo, por tramos de peso/volumen, o gratuito a partir de un importe mínimo. |
| Transportista | Empresa(s) de transporte utilizadas. |
| Restricciones de entrega | Por ejemplo, exigencia de firma de un adulto a la entrega, no entrega en apartados de correos, restricciones adicionales de edad exigidas por el país de destino. |
| Empaquetado | Garantías de embalaje adecuado para transporte de vino (protección ante roturas y temperatura, cuando aplique). |

## 2.1 Documentación que Teralya puede sugerir por país (orientativa, no exhaustiva)

Como apoyo — nunca como asesoría legal ni como gestión en nombre de la Bodega — Teralya puede mostrar a cada Bodega, para el país que quiera evaluar, un listado orientativo del tipo de documentación que ese país suele exigir para la venta de alcohol a distancia, por ejemplo:

- Registro ante la autoridad fiscal competente del país de destino y número de impuesto especial (excise number), cuando ese país lo exija (LEGAL-01 §2).
- Representante fiscal local, en los países que lo exigen explícitamente (por ejemplo, Francia e Italia).
- Garantía financiera que cubra el impuesto especial, si el país de destino la requiere.
- Cualquier licencia o registro de venta de alcohol específico del país de destino o del país de origen del envío.

**Es responsabilidad exclusiva de la Bodega verificar con su propio asesor si esta lista aplica a su caso, mantenerla actualizada y aportar la documentación real si decide vender en ese país.** Teralya no comprueba ni garantiza que una Bodega concreta cumpla esta lista.

## 3. Obligaciones mínimas comunes a toda Bodega

- No enviar a un país donde no tenga cubierta, por sí misma, su obligación de impuesto especial (excise duty) y demás requisitos legales de venta de alcohol (§2.1).
- Respetar el derecho de desistimiento y el flujo de cancelación (LEGAL-07) para cualquier SubPedido bajo su responsabilidad.
- Mantener actualizado el estado logístico de cada SubPedido (`pendiente → aceptado → en_preparacion → enviado → entregado`) conforme al modelo ya aprobado, para que el Comprador tenga visibilidad real.

## 4. Dónde se publica

Estas condiciones se muestran en la ficha pública de cada Bodega y se enlazan desde el detalle de cada vino antes de la compra, junto con LEGAL-03.

---

*Los campos operativos de §2 están implementados en PT-BOD-002, API-006/API-031, el modelo de datos y la ficha pública API-030. La lista orientativa de §2.1 sigue siendo contenido informativo, no una validación automática. Permanecen pendientes la revisión legal antes de producción y la confirmación externa indicada en LEGAL-01 §2 sobre el riesgo de deemed supplier.*
