# CAP-09 — Cierre funcional de la web del MVP

**Teralya · Versión 1.0 · 17/07/2026 · Estado: APROBADO POR EL CTO CON AUTORIZACIÓN DEL CEO**

## 1. Objetivo

Cerrar dos obligaciones ya incluidas en el alcance aprobado del MVP y que permanecían abiertas en `docs/INDEX.md`:

1. La cancelación directa del contrato desde el detalle de un Pedido propio.
2. La configuración y publicación de las condiciones de envío de cada Bodega.

Este documento **no amplía el MVP**. No crea nuevas áreas, roles, canales de soporte, métodos de pago, operadores logísticos ni decisiones económicas. Reutiliza PT-COM-007, PT-BOD-002, PT-PUB-003 y PT-PUB-004.

## 2. CU-033 — Cancelar un Pedido propio

### Actor

Comprador autenticado y propietario del Pedido.

### Pantalla

PT-COM-007 — Detalle de Pedido.

### Precondiciones

- El Pedido pertenece al Comprador autenticado.
- El Pago está confirmado como `pagado`.
- El Pedido está en `pagado` o `en_preparacion`.
- Ningún SubPedido está `enviado`, `entregado` ni en `incidencia`.
- Existe una referencia de Stripe apta para solicitar el reembolso.

### Flujo principal

1. El Comprador abre PT-COM-007.
2. La interfaz muestra la acción **Cancelar pedido** únicamente cuando el backend indica `puede_cancelar = true`.
3. El Comprador confirma expresamente la cancelación.
4. El backend registra una única solicitud en el ledger `cancelacion_pedido`.
5. El backend solicita a Stripe el reembolso completo con clave de idempotencia determinista.
6. Si Stripe confirma `succeeded`, dentro de una transacción:
   - el Pago pasa a `reembolsado`;
   - el Pedido pasa a `cancelado`;
   - los SubPedidos cancelables pasan a `cancelado`;
   - las líneas normales pasan a `cancelado`;
   - el stock se restituye una sola vez;
   - se registra auditoría.
7. Se envía confirmación por correo y se registra la notificación.
8. PT-COM-007 muestra el estado resultante.

### Flujos alternativos

- `pending` o `requires_action`: la solicitud permanece `procesando`; se bloquean transiciones logísticas incompatibles, no se restituye stock todavía y una repetición de API-051 consulta el mismo reembolso hasta obtener estado final.
- `failed` o `canceled`: la solicitud queda `fallida`; el Pedido y el stock no cambian y puede realizarse un reintento seguro.
- Pedido ya expedido, entregado o con incidencia: se responde conflicto y no se toca Pago, stock ni logística.
- Repetición de una cancelación completada: se devuelve el resultado persistido sin crear otro reembolso, reponer stock ni duplicar la notificación.

## 3. HU-033 — Cancelación contractual directa

**Como** Comprador, **quiero** cancelar un Pedido propio desde su detalle mientras todavía sea cancelable, **para** ejercer la cancelación sin llamadas ni trámites desproporcionados.

## 4. CA-033 — Criterios de aceptación de cancelación

- El botón solo aparece cuando `puede_cancelar` es verdadero.
- La confirmación expresa es obligatoria.
- Un Comprador no puede cancelar un Pedido ajeno.
- No se permite cancelar después de expedición, entrega o incidencia.
- Un reintento idéntico no duplica el reembolso, la cancelación, el stock ni la auditoría.
- El stock solo se repone cuando Stripe confirma el reembolso.
- Un reembolso pendiente bloquea el avance logístico incompatible.
- API-020 no expone SubPedidos al Comprador como unidad funcional.
- El resultado y el estado de la cancelación son visibles en PT-COM-007.

## 5. CU-034 — Gestionar y consultar condiciones de envío de una Bodega

### Actores y pantallas

- Bodega autenticada: PT-BOD-002 — Perfil de Bodega.
- Visitante o Comprador: PT-PUB-003 — Ficha de vino y PT-PUB-004 — Ficha de Bodega.

### Datos del MVP

- Países de envío mediante códigos ISO de dos letras.
- Plazo de preparación en días.
- Plazo estimado de entrega en texto.
- Descripción del coste de envío.
- Transportista habitual.
- Restricciones de entrega.
- Condiciones de empaquetado.
- Indicador de capacidad internacional.

### Reglas

- La Bodega solo modifica su propio perfil.
- Los códigos de país se normalizan en mayúsculas, se deduplican y se limitan a 27 destinos.
- El contenido público se obtiene exclusivamente mediante las APIs aprobadas; el Frontend no accede a la base de datos.
- La información es declarativa y no sustituye el cálculo final del checkout ni la responsabilidad legal de cada Bodega.
- No se integra un nuevo transportista ni se añade un motor logístico en este cierre.

## 6. HU-034 — Condiciones de envío transparentes

**Como** Bodega, **quiero** publicar mis destinos, plazos y restricciones de envío, **para** que el Comprador conozca las condiciones antes de completar la compra.

## 7. CA-034 — Criterios de aceptación de condiciones de envío

- PT-BOD-002 permite consultar y actualizar todos los campos definidos en §5.
- API-006 y API-031 devuelven la proyección propia actualizada.
- API-030 publica únicamente los campos logísticos autorizados.
- PT-PUB-004 presenta la información disponible con estados vacíos claros.
- PT-PUB-003 enlaza a las condiciones de la Bodega.
- Los campos internos, fiscales, de comisión y verificación no se exponen públicamente.

## 8. Trazabilidad

| Requisito | Pantalla | API | Datos | Legal |
|---|---|---|---|---|
| CU/HU/CA-033 | PT-COM-007 | API-020, API-051 | `cancelacion_pedido`, Pedido, Pago, SubPedido, PedidoItem, Vino | LEGAL-07, LEGAL-08 |
| CU/HU/CA-034 | PT-BOD-002, PT-PUB-003, PT-PUB-004 | API-006, API-030, API-031 | campos logísticos de `bodega` | LEGAL-09 |

## 9. Cierre

CAP-09 v1.0 queda aprobado como extensión de cierre de CAP-02, CAP-04, CAP-06, CAP-07 y CAP-08. El resto del alcance permanece congelado.
