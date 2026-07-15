# LEGAL-04 — Política de Privacidad (RGPD)

**Teralya · Versión 1.0 · Julio 2026 · Preparado por Claude · Estado: APROBADO PARA LA VERSIÓN ACTUAL**

## ⚠️ Aviso obligatorio

Documento aprobado para la versión actual, redactado a partir del Reglamento (UE) 2016/679 (RGPD) y del modelo de datos ya aprobado (INF-05/INF-06). Aprobado para publicación por el CEO (Decision Log 0024).

---

## 1. Responsable del tratamiento

*[Pendiente: razón social, domicilio y contacto del responsable del tratamiento — completar en cuanto exista constitución legal formal. Contacto provisional de privacidad: el que se publique en la página de contacto de Teralya.]*

## 2. Qué datos tratamos

| Categoría | Ejemplos | Base legal |
|---|---|---|
| Datos de cuenta | Nombre, apellidos, correo, contraseña (hash) | Ejecución del contrato (art. 6.1.b RGPD) |
| Fecha de nacimiento | `fecha_nacimiento`, declaración de mayoría de edad | Obligación legal de verificación de edad para venta de alcohol (art. 6.1.c) |
| Direcciones | Direcciones de envío y facturación propias del Comprador | Ejecución del contrato |
| Datos de pedido | Carrito, pedidos, subpedidos, líneas de pedido | Ejecución del contrato |
| Datos de pago | Referencia de sesión/pago de Stripe; Teralya no almacena datos de tarjeta | Ejecución del contrato; el propio procesamiento de tarjeta lo realiza Stripe como encargado |
| Datos de sesión | Token de sesión HTTP Bearer, IP y agente de usuario en registros de auditoría | Interés legítimo de seguridad (art. 6.1.f) |
| Incidencias | Descripción y estado de incidencias relacionadas con un pedido | Ejecución del contrato / interés legítimo |
| Comunicaciones | Correos transaccionales (confirmación, recuperación de contraseña) | Ejecución del contrato |

No tratamos categorías especiales de datos (art. 9 RGPD) más allá de la fecha de nacimiento estrictamente necesaria para verificar la edad mínima de compra de alcohol.

## 3. Encargados del tratamiento

- **Stripe** (procesamiento de pagos).
- Proveedor de envío de correo transaccional (SMTP) — *[pendiente de fijar proveedor de producción]*.
- Proveedor de almacenamiento de objetos para imágenes de vino — *[pendiente de fijar proveedor de producción]*.

Cada encargado se incorporará con el correspondiente contrato de encargo de tratamiento (art. 28 RGPD) antes de producción real.

## 4. Conservación

Los datos de cuenta y pedido se conservan mientras la cuenta esté activa y durante el plazo legal aplicable a obligaciones fiscales y de consumo tras su cierre. Los registros de auditoría se conservan por motivos de seguridad y trazabilidad durante un plazo proporcionado a su finalidad. *[Plazos concretos pendientes de fijar con asesoría legal antes de producción.]*

## 5. Derechos de las personas usuarias

Cualquier usuario puede ejercer los derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición, así como retirar su consentimiento cuando el tratamiento se base en él, dirigiéndose al canal de contacto de privacidad de Teralya. También puede reclamar ante la autoridad de control de protección de datos de su país.

## 6. Transferencias internacionales

Teralya opera dentro de la Unión Europea. Si algún encargado del tratamiento (por ejemplo, un proveedor de infraestructura) transfiere datos fuera del EEE, se hará bajo las garantías del RGPD (cláusulas contractuales tipo u otro mecanismo válido). *[A confirmar según los proveedores de infraestructura finalmente elegidos.]*

## 7. Menores de edad

Teralya no está dirigida a menores de 18 años (LEGAL-06). No se solicita ni trata intencionadamente información de menores más allá de la fecha de nacimiento necesaria para verificar que no lo son.

## 8. Seguridad

Las contraseñas se almacenan como hash, no en texto plano. El acceso se protege con límites de intentos en login y recuperación de contraseña. Las imágenes se cargan mediante URLs prefirmadas con confirmación posterior. *[Ver LEGAL-01 y la documentación técnica INF-07/INF-08 para el detalle de controles de seguridad implementados.]*

## 9. Cambios en esta política

Los cambios sustanciales se notificarán a los usuarios registrados y llevarán fecha de versión visible.

---

*Pendiente de revisión por un abogado o DPO especializado en protección de datos de la UE antes de producción real, y de completar los datos identificativos del responsable del tratamiento en cuanto exista constitución legal formal.*
