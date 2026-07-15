# LEGAL-03 — Términos y Condiciones de Uso

**Teralya · Versión 1.1 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL**

## ⚠️ Aviso obligatorio

Este documento está aprobado para la versión actual, redactado a partir del marco normativo identificado en LEGAL-01 y listo para publicarse en la plataforma. Aprobado para publicación por el CEO, que declara actuar como abogado responsable (Decision Log 0024).

---

## 1. Quiénes somos y qué es Teralya

Teralya es un **marketplace europeo** que conecta a bodegas fundadoras con compradores particulares en la Unión Europea. **Teralya no compra ni vende vino en ningún momento.** Cada botella publicada en la plataforma se vende directamente por la bodega correspondiente, que actúa como única vendedora. Teralya actúa exclusivamente como intermediario tecnológico y de pago: pone a disposición el catálogo, procesa el cobro a través de Stripe, reparte el importe entre las bodegas correspondientes y cobra una comisión de intermediación (15% estándar, Decision Log 0008) sobre cada venta. **Teralya nunca es parte del contrato de compraventa: el contrato se forma exclusivamente entre el Comprador y la Bodega. Cuando compras en Teralya, le compras a la bodega, no a Teralya.**

*[Pendiente: razón social, domicilio, NIF/CIF y datos registrales de la sociedad titular de Teralya — completar en cuanto exista constitución legal formal.]*

### 1.1 Responsabilidad legal y fiscal por país (Decision Log 0025)

Como Teralya no compra ni vende vino y no es parte del contrato de compraventa, **no es responsable de las obligaciones fiscales, aduaneras ni legales que varían de un país a otro de la Unión Europea** (impuestos especiales sobre el alcohol, IVA, representación fiscal, licencias de venta de alcohol, edad mínima local, restricciones de envío, etc.). Esa responsabilidad recae íntegramente en **cada Bodega**, tanto respecto del país al que vende como del país desde el que envía. Cada Bodega debe asegurarse, antes de habilitar la venta o el envío a un país determinado, de que cumple la normativa aplicable en ese país y de que dispone de la documentación necesaria (registro fiscal, número de impuesto especial, representante fiscal local si su país de destino lo exige, etc.).

Teralya puede, a título meramente orientativo y sin que ello constituya asesoría legal ni asunción de responsabilidad, sugerir a cada Bodega qué documentos suelen exigir los distintos países de la Unión Europea para la venta de alcohol (ver LEGAL-09). Es responsabilidad exclusiva de la Bodega verificar, obtener y aportar esa documentación si decide vender en un país concreto; Teralya no verifica ni garantiza el cumplimiento fiscal o legal de ninguna Bodega.

## 2. A quién nos dirigimos

Estos Términos aplican a cualquier persona que navegue, se registre o compre en Teralya (el "Comprador") y a cualquier bodega que publique vinos en la plataforma (la "Bodega"). El uso de Teralya requiere ser mayor de 18 años (ver LEGAL-06).

## 3. Registro de cuenta

- El registro exige nombre, apellidos, correo electrónico, contraseña, fecha de nacimiento, y la declaración expresa de mayoría de edad y aceptación de las condiciones de alcohol (LEGAL-06).
- El Comprador es responsable de la veracidad de sus datos y de la custodia de sus credenciales.
- Teralya puede suspender o cancelar cuentas que incumplan estos Términos, en particular las que falseen la fecha de nacimiento.

## 4. El papel de la Bodega como única vendedora

- Cada Bodega es responsable de la descripción, el precio, el stock y la calidad del vino que publica.
- Cada Bodega gestiona su propio envío dentro del marco general de Teralya; sus condiciones específicas de envío se muestran en su ficha (ver LEGAL-09).
- Cada Bodega es responsable de decidir a qué países vende y desde qué país envía, y de cumplir la normativa fiscal, aduanera y legal de ambos (ver §1.1).
- Teralya modera el alta de bodegas y de vinos, pero no garantiza ni verifica cada publicación individualmente antes de su venta, ni verifica el cumplimiento fiscal o legal de ninguna Bodega en los países en los que opera.

## 5. Pedidos, precio y moneda

- Todos los precios se muestran en euros (EUR), impuestos incluidos cuando corresponda.
- Un pedido puede dividirse en varios "SubPedidos", uno por Bodega, cada uno con su propio estado de preparación y envío.
- El pedido se confirma únicamente cuando el pago ha sido autorizado por Stripe; antes de eso no hay compraventa perfeccionada.

## 6. Pago

- El pago se procesa mediante Stripe Checkout. Teralya no almacena datos de tarjeta.
- El cargo se confirma de forma asíncrona mediante el webhook de Stripe; si el stock ya no está disponible en el momento de la confirmación, el sistema revierte la operación de forma atómica y no permite stock negativo.

## 7. Derecho de desistimiento y cancelación

Ver LEGAL-07: el Comprador dispone de 14 días naturales para desistir de la compra, salvo las excepciones legales aplicables, y de un botón de cancelación de contrato conforme a la Directiva (UE) 2023/2673.

## 8. Incidencias y reembolsos

Ver LEGAL-08. Las incidencias relacionadas con un pedido, subpedido, bodega o vino se gestionan por la administración de Teralya siguiendo el ciclo abierta → en_revision → resuelta → cerrada.

## 9. Propiedad intelectual

Las marcas, el diseño y el software de Teralya son propiedad de Teralya o de sus licenciantes. El contenido publicado por cada Bodega (fotos, descripciones) es responsabilidad de la Bodega, que declara tener los derechos necesarios para publicarlo.

## 10. Limitación de responsabilidad

Teralya no es responsable de la calidad, el etiquetado, la conservación o el transporte del vino, que corresponde a cada Bodega vendedora, sin perjuicio de la responsabilidad que la normativa de consumo atribuya a la plataforma como intermediaria.

## 11. Ley aplicable y jurisdicción

*[Pendiente de fijar con asesoría legal: ley aplicable y fuero, coherente con la normativa de protección al consumidor del país de residencia del Comprador cuando sea de obligado cumplimiento.]*

## 12. Modificaciones

Estos Términos pueden actualizarse; los cambios sustanciales se notificarán a los usuarios registrados y llevarán fecha de versión visible.

---

*Documento relacionado con CU-006 y CAP-02. Pendiente de revisión por un abogado especializado en comercio electrónico de la UE antes de producción real.*
