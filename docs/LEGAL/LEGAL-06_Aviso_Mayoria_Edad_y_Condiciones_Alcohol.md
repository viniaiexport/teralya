# LEGAL-06 — Aviso de Mayoría de Edad y Condiciones de Venta de Alcohol

**Teralya · Versión 1.0 (`LEGAL-06-v1.0`) · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual, redactado a partir de LEGAL-01 §1. Aprobado para publicación por el CEO (Decision Log 0024).

**Este documento es el que referencia `ALCOHOL_TERMS_VERSION` en la configuración del backend.** El identificador de versión vigente es **`LEGAL-06-v1.0`**. Cualquier cambio de fondo en este documento debe ir acompañado de un nuevo identificador de versión (`LEGAL-06-v1.1`, etc.) y de una nueva decisión registrada en el Decision Log, porque cada aceptación queda guardada de forma permanente en el pedido/cuenta del comprador (`version_condiciones_alcohol`) y no debe reescribirse retroactivamente.

---

## 1. Edad mínima

Para comprar en Teralya es obligatorio ser **mayor de 18 años**, con independencia del país de residencia o de envío. Esta edad es igual o más estricta que la exigida en cualquier Estado miembro de la Unión Europea para la venta de vino (LEGAL-01 §1 detalla las excepciones nacionales, todas por debajo de 18 años, que Teralya no aplica).

## 2. Cómo se verifica en el MVP

- En el registro, el Comprador introduce su fecha de nacimiento (`fecha_nacimiento`) y declara expresamente ser mayor de edad (`declaracion_mayoria_edad`) y aceptar estas condiciones (`aceptacion_condiciones_alcohol`).
- El backend calcula la edad a partir de la fecha de nacimiento y rechaza el registro si es inferior a `MINIMUM_PURCHASE_AGE` (18).
- No se realiza verificación documental de identidad en el MVP: es una declaración responsable del propio Comprador, con las consecuencias legales de una declaración falsa.
- Falsear la fecha de nacimiento o la declaración de mayoría de edad constituye un incumplimiento grave de los Términos y Condiciones (LEGAL-03) y puede dar lugar a la cancelación de la cuenta.

## 3. Novedad a vigilar

La Comisión Europea recomendó en abril de 2026 que los Estados miembros ofrezcan una European Digital Identity Wallet antes de fin de 2026, con la verificación de edad para compra de alcohol como caso de uso previsto. Todavía no es una obligación operativa para Teralya, pero debe revisarse periódicamente por si se convierte en un estándar exigible.

## 4. Condiciones aplicables a la compra de alcohol

Al aceptar esta casilla en el registro, el Comprador declara y acepta que:

1. Tiene 18 años o más en el momento del registro y en cada compra.
2. El vino comprado en Teralya está destinado a consumo personal responsable, conforme a la normativa de su país de residencia.
3. Es responsable de cumplir la normativa local sobre consumo y transporte de alcohol en el momento de la entrega.
4. Cada Bodega vendedora puede aplicar restricciones adicionales de edad o de entrega exigidas por su normativa local de envío (ver LEGAL-09).
5. Teralya, como plataforma, no vende ni sirve alcohol directamente: facilita la venta directa entre la Bodega y el Comprador (LEGAL-03 §1).

## 5. Consumo responsable

Teralya promueve el consumo responsable de alcohol. El vino es una bebida alcohólica; su consumo excesivo es perjudicial para la salud. *[Añadir aquí, antes de producción, el mensaje de consumo responsable exigido por la normativa local aplicable en cada país de destino, si difiere de este texto general.]*

---

*Pendiente de revisión por un abogado especializado en venta de alcohol en la UE antes de producción real. Cualquier cambio de fondo requiere una nueva versión (`LEGAL-06-v1.1`+) y una decisión registrada, por su efecto retroactivo sobre `ALCOHOL_TERMS_VERSION`.*
