# PORTADA

- **Teralya**
- **CAP-02**
- **Modelo de Datos Funcional**
- **Versión 1.1**
- **Estado: EN REVISIÓN**
- **Fecha: 11/07/2026**

---

# CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado | Descripción |
|---|---|---|---|---|
| 1.0 | Julio de 2026 | Arquitecto de Producto Teralya | INCOMPLETA | Archivo inicial sin el desarrollo completo del modelo de datos. |
| 1.1 | 11/07/2026 | Arquitecto de Datos Teralya | EN REVISIÓN | Reconstrucción trazable con CAP-01 v1.0, INF-05 v1.2 e INF-06 v1.1; incorpora Incidencia y consolida el modelo funcional vigente. |

---

# OBJETIVO DEL DOCUMENTO

Definir el modelo de datos funcional del MVP de Teralya, marketplace europeo en el que las bodegas venden vino directamente a compradores de la Unión Europea.

El documento establece qué información necesita el producto, qué entidades funcionales la organizan, cómo se relacionan, qué cardinalidades existen y qué reglas de integridad deben respetarse durante el ciclo comercial.

El modelo preserva la separación esencial del marketplace:

- Teralya no compra ni almacena stock propio.
- Cada vino pertenece a una bodega.
- La bodega conserva la responsabilidad sobre su catálogo, stock, preparación y envío.
- El comprador realiza una única compra y consulta un Pedido completo.
- El sistema divide internamente el Pedido en SubPedidos, uno por bodega implicada.
- El pago y la comisión del marketplace quedan trazados.

Este capítulo es funcional. No define pantallas, endpoints, componentes frontend, migraciones, código, infraestructura ni decisiones de implementación nuevas.

---

# ALCANCE

El modelo cubre exclusivamente el MVP aprobado:

- identidad y acceso por rol;
- comprador y acreditación de mayoría de edad;
- alta y validación de bodegas;
- catálogo de vinos y disponibilidad;
- carrito multi-bodega;
- checkout autenticado;
- direcciones de envío y facturación;
- pago mediante Stripe Checkout y reparto mediante Stripe Connect;
- Pedido completo y SubPedidos internos;
- gestión logística básica;
- incidencias operativas mínimas;
- recuperación de contraseña;
- preferencia de idioma;
- notificaciones y auditoría necesarias para trazabilidad.

Quedan fuera del alcance:

- compra o custodia de stock por Teralya;
- CRM de soporte;
- chat entre comprador y bodega;
- sistema avanzado de tickets;
- permisos granulares fuera de los roles del MVP;
- descuentos como funcionalidad operativa del MVP, aunque existan campos reservados en el esquema;
- cualquier función no aprobada en CAP-01 o no reflejada en INF-05/INF-06 vigentes.

---

# CRITERIO DE MODELADO

CAP-01 define entidades funcionales. INF-05 e INF-06 definen cómo se persiste la información aprobada. Por ello, una entidad funcional no implica necesariamente una tabla independiente.

| Entidad funcional de CAP-01 | Representación persistente vigente |
|---|---|
| Cuenta de usuario | `usuario` |
| Comprador | `comprador`, como extensión 1:1 de `usuario` |
| Bodega | `bodega`; su personal se relaciona mediante `usuario.bodega_id` |
| Administrador | Rol `administrador` dentro de `usuario`; no existe tabla propia |
| Vino | `vino`, con recursos gráficos en `imagen` |
| Carrito | `carrito` y `carrito_item` |
| Checkout | Proceso de validación y conversión; no existe tabla propia |
| Dirección de envío | `direccion` y snapshots congelados en `pedido` |
| Pago | `pago`, `cuenta_stripe_connect` y distribución económica por `subpedido` |
| Pedido | `pedido` y sus líneas en `pedido_item` |
| SubPedido | `subpedido` |
| Incidencia | `incidencia`, con historial mínimo mediante `auditoria` |
| Solicitud de recuperación de contraseña | `solicitud_recuperacion_password` |
| Idioma | Preferencia en `usuario.idioma` y datos lingüísticos relacionados; no existe tabla propia |

Las estructuras `imagen`, `cuenta_stripe_connect`, `carrito_item`, `pedido_item`, `notificacion` y `auditoria` son entidades persistentes de soporte ya aprobadas en INF-05/INF-06. No amplían por sí mismas el alcance funcional.

---

# ENTIDADES FUNCIONALES

## 1. Cuenta de usuario

### Objetivo

Identificar, autenticar y controlar el acceso de compradores, personal de bodega y administradores.

### Atributos funcionales esenciales

- Identificador único.
- Email único.
- Credencial segura.
- Nombre, apellidos y teléfono, cuando se informen.
- Rol: comprador, bodega o administrador.
- Bodega asociada cuando el usuario pertenece a una bodega.
- Estado de cuenta.
- Email verificado.
- Idioma y zona horaria.
- Información mínima de seguridad, bloqueo y recuperación.
- Fechas de creación, actualización y último acceso.

### Relaciones y cardinalidades

- Una Cuenta de usuario puede tener cero o un perfil Comprador.
- Una Bodega puede tener cero o muchas Cuentas de usuario.
- Una Cuenta de usuario de bodega pertenece como máximo a una Bodega.
- Un Administrador es una Cuenta de usuario con rol administrador.
- Una Cuenta de usuario puede originar muchas Notificaciones y muchos eventos de Auditoría.

### Reglas de integridad

- El email es único.
- Toda cuenta tiene un rol.
- La asociación a bodega solo se utiliza con rol bodega.
- Una cuenta de bodega no puede operar comercialmente si su bodega no está validada.
- La cuenta no permite acceder a información de otro usuario sin autorización.
- Las credenciales no se almacenan en texto plano.

## 2. Comprador

### Objetivo

Representar a la persona que descubre y compra vino en Teralya.

### Atributos funcionales esenciales

- Cuenta de usuario asociada.
- Fecha de nacimiento obligatoria.
- Declaración de mayoría de edad, con fecha y hora de registro.
- Aceptación de las condiciones de compra de alcohol, con fecha, hora y versión aceptada.
- Preferencia de comunicaciones.
- Moneda y país habitual, cuando se informen.
- Direcciones utilizadas.
- Historial y métricas derivadas de pedidos.

### Relaciones y cardinalidades

- Cada Comprador corresponde a una Cuenta de usuario.
- Un Comprador puede tener muchos Carritos a lo largo del tiempo, pero solo uno activo.
- Un Comprador puede tener muchas Direcciones.
- Un Comprador puede realizar muchos Pedidos.
- Cada Pedido pertenece a un único Comprador.

### Reglas de integridad

- El comprador debe introducir su fecha de nacimiento.
- Debe cumplir la edad mínima configurada y aceptar las condiciones aplicables.
- Debe autenticarse para completar Checkout.
- Solo consulta sus propios Pedidos.
- Opera sobre el Pedido completo y no gestiona SubPedidos.

## 3. Bodega

### Objetivo

Representar a la empresa productora que vende directamente sus vinos y asume la preparación y el envío.

### Atributos funcionales esenciales

- Identificador.
- Nombre comercial y datos legales/fiscales.
- Estado de alta, revisión, aprobación y actividad.
- Perfil público, historia, región, país y denominación de origen.
- Datos de contacto.
- Tipo de bodega y condiciones comerciales.
- Comisión aplicable.
- Información logística y países de envío.
- Estado de verificación y documentación.
- Datos de publicación y posicionamiento.

### Relaciones y cardinalidades

- Una Bodega puede tener muchas Cuentas de usuario de su personal.
- Una Bodega puede publicar muchos Vinos.
- Cada Vino pertenece a una única Bodega.
- Una Bodega tiene como máximo una Cuenta Stripe Connect.
- Una Bodega puede recibir muchos SubPedidos.
- Una Bodega puede estar asociada a muchas Incidencias.

### Reglas de integridad

- La bodega debe estar validada antes de operar y publicar vinos.
- La comisión debe quedar registrada antes de su activación.
- La bodega solo accede a sus propios vinos y SubPedidos.
- No puede eliminarse si conserva relaciones comerciales que requieren trazabilidad.
- La bodega envía directamente al comprador; Teralya no adquiere el stock.

## 4. Administrador

### Objetivo

Representar al usuario interno autorizado para supervisar el marketplace.

### Atributos funcionales esenciales

El Administrador utiliza los atributos de Cuenta de usuario. Su condición se expresa mediante el rol administrador y el estado activo de la cuenta.

### Relaciones y cardinalidades

- Un Administrador puede validar muchas Bodegas.
- Puede revisar, publicar u ocultar muchos Vinos.
- Puede consultar Pedidos y sus SubPedidos.
- Puede gestionar muchas Incidencias.
- Sus operaciones relevantes generan eventos de Auditoría.

### Reglas de integridad

- No existe una tabla funcional independiente de Administrador.
- Solo una cuenta con rol administrador y permisos activos accede al área administrativa.
- Toda actuación crítica debe ser trazable.
- La administración no cambia la propiedad del stock ni asume el envío de la bodega.

## 5. Vino

### Objetivo

Representar el producto ofrecido por una bodega en el catálogo.

### Atributos funcionales esenciales

- Identificador y bodega propietaria.
- SKU y estado de publicación.
- Nombre, tipo, añada, precio y moneda.
- Origen, región y denominación.
- Variedades, crianza, graduación, volumen y descripción.
- Notas de cata, maridaje, certificaciones y premios.
- Stock disponible, reservado y mínimo.
- Indicador de disponibilidad para venta.
- Datos logísticos.
- Imágenes y metadatos de publicación.

### Relaciones y cardinalidades

- Cada Vino pertenece a una Bodega.
- Un Vino puede tener muchas Imágenes.
- Un Vino puede aparecer en muchos Carritos mediante líneas de carrito.
- Un Vino puede aparecer en muchos Pedidos mediante líneas congeladas.
- Un Vino puede estar asociado a muchas Incidencias.

### Reglas de integridad

- Solo se muestra y vende si está publicado, disponible y pertenece a una bodega validada.
- Requiere precio, stock válido e imagen antes de publicarse.
- El stock disponible no puede ser negativo.
- No se elimina si forma parte de un Pedido; debe conservarse la trazabilidad.
- Precio y datos comerciales se revalidan durante Checkout.

## 6. Carrito

### Objetivo

Agrupar temporalmente los vinos seleccionados antes de la compra.

### Atributos funcionales esenciales

- Identificador y comprador propietario.
- Estado.
- Líneas de vino y cantidades.
- Precio unitario e importe provisional de cada línea.
- Número de productos y botellas.
- Subtotal, gastos de envío, descuentos reservados y total provisional.
- Fechas de creación, actualización y conversión.

### Relaciones y cardinalidades

- Cada Carrito pertenece a un Comprador.
- Un Comprador tiene como máximo un Carrito activo.
- Un Carrito contiene una o muchas líneas `carrito_item` para continuar la compra.
- Cada línea pertenece a un Carrito y referencia un Vino.
- Un Vino aparece como máximo una vez en un mismo Carrito; nuevas unidades incrementan la cantidad.
- Un Carrito válido inicia un Checkout y puede convertirse en un Pedido.

### Reglas de integridad

- Puede contener vinos de varias bodegas.
- Cada cantidad es de al menos una botella.
- La disponibilidad, precio y stock se revalidan antes del pago.
- Un Carrito convertido deja de ser modificable.
- El total guardado en carrito no sustituye al cálculo definitivo del Checkout.

## 7. Checkout

### Objetivo

Validar y preparar la compra antes del pago.

### Atributos funcionales esenciales

Checkout no conserva identidad persistente propia. Utiliza y valida:

- Comprador autenticado.
- Carrito activo y sus líneas.
- Disponibilidad, cantidades y precios vigentes.
- Dirección de envío y, cuando corresponda, facturación.
- Mayoría de edad y aceptaciones aplicables.
- Gastos de envío, impuestos y total definitivo.
- Bodegas implicadas y capacidad de cobro mediante Stripe Connect.

### Relaciones y cardinalidades

- Un Comprador realiza Checkout sobre un Carrito válido.
- Checkout utiliza una Dirección de envío.
- Un Checkout correcto prepara un Pedido y un Pago.
- Una compra genera un SubPedido por cada Bodega presente en el Carrito.

### Reglas de integridad

- Requiere autenticación.
- No continúa con carrito vacío o inválido.
- Revalida precios, stock, publicación y disponibilidad.
- No confirma el Pedido como pagado antes de la confirmación fiable del Pago.
- No crea una tabla propia ni constituye un módulo comercial independiente.

## 8. Dirección de envío

### Objetivo

Identificar el destino físico de la compra y conservar los datos utilizados en el momento de confirmación.

### Atributos funcionales esenciales

- Propietario y tipo de propietario.
- Destinatario, empresa, dirección y datos adicionales.
- Código postal, ciudad, provincia y país.
- Contacto, teléfono y email.
- Uso para envío o facturación.
- Indicador de dirección principal y activa.

### Relaciones y cardinalidades

- Un Comprador puede tener muchas Direcciones.
- Una Bodega puede tener muchas Direcciones operativas.
- Cada Pedido referencia, cuando exista, una Dirección de envío y otra de facturación.
- Cada Pedido conserva snapshots de ambas direcciones usadas.

### Reglas de integridad

- Solo existe una dirección principal por propietario.
- Una dirección inactiva no se selecciona para nuevas compras.
- La compra exige una dirección de envío válida.
- Los snapshots del Pedido permanecen inmutables aunque la dirección original cambie.

## 9. Pago

### Objetivo

Registrar el cobro único al comprador, la comisión de Teralya y el reparto correspondiente a las bodegas.

### Atributos funcionales esenciales

- Identificador y Pedido asociado.
- Referencias interna y de Stripe.
- Subtotal, envío, impuestos, comisión y total cobrado.
- Totales repartido y reembolsado.
- Método, moneda y estado autoritativo.
- Fechas de autorización, captura, liquidación y reembolso.
- Cuenta Stripe Connect de cada bodega, alcanzada mediante sus SubPedidos.

### Relaciones y cardinalidades

- Cada Pago pertenece a un único Pedido.
- Cada Pedido tiene como máximo un Pago activo registrado.
- Un Pago se distribuye entre uno o muchos SubPedidos.
- Cada SubPedido representa la porción económica de una Bodega.
- Cada Bodega tiene como máximo una Cuenta Stripe Connect.

### Reglas de integridad

- Solo un pago confirmado permite confirmar la compra.
- El total cobrado debe corresponder al total definitivo del Pedido.
- El total repartido no puede superar el total cobrado.
- El pago no referencia una única Cuenta Stripe Connect porque un Pedido puede contener varias bodegas.
- La fuente autoritativa del estado económico es Pago.
- La comisión aplicable queda registrada para garantizar trazabilidad.

## 10. Pedido

### Objetivo

Representar la compra completa visible para el comprador.

### Atributos funcionales esenciales

- Identificador y número único visible.
- Comprador.
- Líneas de producto congeladas.
- Subtotal, envío, impuestos, descuentos reservados y total.
- Datos informativos de pago y relación con Pago.
- Snapshots de direcciones.
- Estado global.
- Fechas de creación, actualización, pago y cierre.

### Relaciones y cardinalidades

- Cada Pedido pertenece a un Comprador.
- Un Comprador puede tener muchos Pedidos.
- Un Pedido contiene una o muchas líneas `pedido_item`.
- Cada línea referencia un Vino y conserva sus datos comerciales históricos.
- Un Pedido tiene uno o muchos SubPedidos según el número de bodegas implicadas.
- Un Pedido se relaciona con un Pago.
- Un Pedido puede tener muchas Incidencias.

### Reglas de integridad

- El número de Pedido es único.
- El comprador consulta el Pedido completo, no los SubPedidos como unidades comerciales independientes.
- Los datos del vino, precio y direcciones se congelan al confirmar.
- El estado global se deriva de la situación económica y del conjunto de SubPedidos.
- Un Pedido pagado no se altera de forma que destruya su trazabilidad histórica.

## 11. SubPedido

### Objetivo

Representar la parte interna de un Pedido que corresponde a una única Bodega.

### Atributos funcionales esenciales

- Pedido, Bodega y Pago asociados.
- Líneas de producto correspondientes a esa Bodega.
- Subtotal, envío, impuestos, comisión y total de la porción.
- Estado logístico.
- Transportista, seguimiento y fechas de preparación, envío y entrega.
- Fecha del último cambio de estado.

### Relaciones y cardinalidades

- Cada SubPedido pertenece a un Pedido.
- Cada SubPedido pertenece a una Bodega.
- Cada SubPedido se relaciona con el Pago del Pedido.
- Cada SubPedido contiene una o muchas líneas de Pedido de esa Bodega.
- Un Pedido genera un SubPedido por cada Bodega implicada.
- Una Bodega puede recibir muchos SubPedidos.
- Un SubPedido puede tener muchas Incidencias.

### Reglas de integridad

- No constituye una compra separada para el comprador.
- La Bodega solo gestiona sus propios SubPedidos.
- `subpedido.estado` es la fuente de verdad del flujo logístico.
- Las líneas de Pedido no duplican estados logísticos; solo reflejan excepciones de línea como cancelación o devolución.
- Un SubPedido entregado no vuelve a preparación.
- No se modifica información global del Pedido desde un SubPedido.

## 12. Incidencia

### Objetivo

Registrar un problema operativo básico del MVP para su revisión administrativa.

### Atributos funcionales esenciales

- Identificador.
- Tipo.
- Estado propio.
- Fecha.
- Descripción o información mínima.
- Pedido, SubPedido, Bodega o Vino relacionados cuando aplique.
- Fechas de creación y actualización.
- Historial mínimo mediante Auditoría.

### Relaciones y cardinalidades

- Una Incidencia se relaciona al menos con un Pedido, SubPedido, Bodega o Vino.
- Un Pedido puede tener muchas Incidencias.
- Un SubPedido puede tener muchas Incidencias.
- Una Bodega puede tener muchas Incidencias.
- Un Vino puede tener muchas Incidencias.
- Un Administrador gestiona muchas Incidencias.
- Una Incidencia puede generar muchos eventos de Auditoría.

### Reglas de integridad

- Solo administración gestiona incidencias.
- Debe existir al menos una entidad relacionada.
- Las relaciones conservan integridad referencial.
- No se cierra sin la información mínima exigida.
- Los cambios de estado relevantes quedan auditados.
- No se convierte en CRM, chat, tickets ni soporte avanzado.

## 13. Solicitud de recuperación de contraseña

### Objetivo

Permitir que una Cuenta de usuario recupere el acceso de forma segura.

### Atributos funcionales esenciales

- Cuenta y email asociados.
- Token o referencia segura.
- Fecha de generación y caducidad.
- Estado derivado de su validez y uso.
- Nueva credencial segura cuando el proceso concluye.

### Relaciones y cardinalidades

- Toda Solicitud pertenece a una Cuenta de usuario existente.
- Una Cuenta puede realizar solicitudes a lo largo del tiempo.
- Cada solicitud se conserva en `solicitud_recuperacion_password`, separada de la Cuenta de usuario.

### Reglas de integridad

- El token debe ser válido y no estar caducado.
- No se revela si un email inexistente está registrado mediante respuestas inseguras.
- La nueva contraseña cumple las reglas mínimas y su confirmación coincide.
- La credencial nunca se almacena en texto plano.

## 14. Idioma

### Objetivo

Adaptar la experiencia inicial del comprador mediante una preferencia lingüística dentro del alcance aprobado.

### Atributos funcionales esenciales

- Código o valor de idioma preferido.
- Idioma detectado del navegador cuando sea posible.
- Idioma seleccionado por el usuario.

### Relaciones y cardinalidades

- Una Cuenta de usuario tiene como máximo un idioma preferido vigente.
- El idioma se aplica al Comprador durante el registro y uso de la plataforma.
- Se representa como atributo de usuario; no existe tabla propia en el MVP.

### Reglas de integridad

- El usuario puede cambiar el idioma detectado antes de finalizar el registro.
- La selección no elimina requisitos legales ni controles de mayoría de edad.
- No se incorpora IA para la gestión del idioma.

---

# ENTIDADES PERSISTENTES DE SOPORTE

## Cuenta Stripe Connect

Vincula una Bodega con su cuenta de Stripe para recibir la porción que le corresponde. La relación es 1:1; la bodega no puede vender sin una cuenta operativa conforme a las validaciones aprobadas. Teralya no almacena datos bancarios sensibles.

## Imagen

Asocia recursos gráficos a Vino o Bodega. Puede haber muchas imágenes por entidad, pero solo una principal. El texto alternativo es obligatorio y la imagen debe permanecer vinculada a una entidad válida según las validaciones del sistema.

## Línea de Carrito

Relaciona un Carrito con un Vino, su cantidad y sus importes provisionales. La combinación Carrito–Vino es única y la cantidad es positiva.

## Línea de Pedido

Relaciona Pedido, SubPedido y Vino. Conserva snapshots de nombre, añada, bodega y precio para mantener el histórico. Su estado solo expresa excepciones de línea; el estado logístico corresponde al SubPedido.

## Notificación

Registra comunicaciones automáticas a usuarios, relacionadas opcionalmente con Pedido o SubPedido. En el MVP el canal aprobado es email. Cada envío conserva estado, contenido y evento de origen.

## Auditoría

Registra operaciones relevantes, autenticaciones y cambios de estado. Puede vincularse a cualquier entidad mediante tipo e identificador, incluida Incidencia. Es un registro de trazabilidad que no debe modificarse ni eliminarse.

---

# MATRIZ DE RELACIONES Y CARDINALIDADES

| Origen | Relación | Destino | Cardinalidad funcional |
|---|---|---|---|
| Cuenta de usuario | extiende | Comprador | 1 : 0..1 |
| Bodega | agrupa personal | Cuenta de usuario | 1 : 0..N |
| Bodega | posee | Vino | 1 : 0..N |
| Bodega | dispone de | Cuenta Stripe Connect | 1 : 0..1 |
| Comprador | mantiene | Carrito | 1 : 0..N históricos; máximo 1 activo |
| Carrito | contiene | Línea de Carrito | 1 : 1..N para iniciar Checkout |
| Vino | aparece en | Línea de Carrito | 1 : 0..N |
| Comprador | realiza | Checkout | 1 : 0..N |
| Checkout | utiliza | Dirección | N : 1 por uso |
| Comprador | realiza | Pedido | 1 : 0..N |
| Pedido | registra | Pago | 1 : 0..1 |
| Pedido | genera | SubPedido | 1 : 1..N |
| Bodega | recibe | SubPedido | 1 : 0..N |
| Pedido | contiene | Línea de Pedido | 1 : 1..N |
| SubPedido | contiene | Línea de Pedido | 1 : 1..N |
| Vino | origina snapshot en | Línea de Pedido | 1 : 0..N |
| Pedido | puede tener | Incidencia | 1 : 0..N |
| SubPedido | puede tener | Incidencia | 1 : 0..N |
| Bodega | puede tener | Incidencia | 1 : 0..N |
| Vino | puede tener | Incidencia | 1 : 0..N |
| Usuario | recibe | Notificación | 1 : 0..N |
| Usuario | origina | Auditoría | 1 : 0..N |

---

# REGLAS DE INTEGRIDAD TRANSVERSALES

## Identidad y acceso

- Los identificadores son únicos.
- El email de usuario es único.
- El rol determina el ámbito funcional de acceso.
- La relación entre personal de bodega y bodega debe conservarse.
- Los datos privados solo son visibles para su propietario o para administración autorizada.

## Propiedad comercial

- Cada Vino pertenece a una única Bodega.
- Cada SubPedido pertenece a una única Bodega y un único Pedido.
- Cada línea de Pedido pertenece al mismo Pedido que su SubPedido y corresponde a un Vino de la Bodega del SubPedido.
- Solo existe un SubPedido por Bodega dentro de un Pedido.

## Importes y snapshots

- Cantidades e importes operativos no pueden ser negativos.
- Los totales de líneas, SubPedidos, Pedido y Pago deben cuadrar según sus conceptos.
- Los datos históricos del vino, precio y direcciones quedan congelados al confirmar.
- La comisión queda registrada en el Pago y en la porción económica de cada SubPedido.

## Estados

- Pago es la fuente de verdad del estado económico.
- SubPedido es la fuente de verdad del estado logístico.
- Pedido representa el estado global agregado visible al comprador.
- Las transiciones inválidas se rechazan.
- Los cambios críticos generan Auditoría.

## Integridad referencial

- No se permiten líneas huérfanas de Carrito, Pedido o SubPedido.
- No se permiten Incidencias sin al menos una relación funcional.
- Las asociaciones polimórficas de Direcciones, Imágenes y Auditoría deben validarse en la aplicación o mediante los mecanismos técnicos aprobados.
- Las eliminaciones no deben destruir el histórico comercial o legal.

---

# CICLO COMERCIAL DEL DATO

## 1. Catálogo

La Bodega validada crea y mantiene Vinos. El Administrador revisa su publicación. Solo los vinos publicados, disponibles y con stock válido aparecen en el catálogo.

## 2. Carrito

El Comprador selecciona vinos de una o varias bodegas. El Carrito conserva cantidades y valores provisionales sin reservar como definitivos los datos económicos de la compra.

## 3. Checkout

El sistema autentica al Comprador, verifica edad y aceptaciones, revalida Vinos, precios y stock, comprueba direcciones y calcula el total definitivo. Checkout no crea una entidad persistente independiente.

## 4. Pago

Stripe Checkout procesa el cobro único. El resultado fiable del proveedor actualiza Pago. La Cuenta Stripe Connect de cada Bodega permite el reparto correspondiente y la retención de la comisión de Teralya.

## 5. Pedido

La compra confirmada genera un Pedido completo para el Comprador. Se congelan líneas, precios y direcciones para conservar el histórico.

## 6. SubPedidos

El sistema agrupa las líneas por Bodega y genera un SubPedido interno por cada una. Cada Bodega prepara y envía únicamente su parte. El estado global del Pedido se actualiza a partir del conjunto de SubPedidos.

## 7. Incidencias y cierre

Administración puede registrar Incidencias mínimas relacionadas con Pedido, SubPedido, Bodega o Vino. Sus cambios quedan auditados. El Pedido se cierra cuando su situación económica y logística alcanza un estado final permitido.

---

# TRAZABILIDAD DOCUMENTAL

| Contenido de CAP-02 v1.1 | Fuente oficial |
|---|---|
| Entidades funcionales, objetivos, responsabilidades y relaciones | CAP-01 v1.0, APROBADO |
| Representación persistente, campos, claves y estructuras de soporte | INF-05 v1.2, EN REVISIÓN |
| Definición y significado de campos, índices y reglas asociadas | INF-06 v1.1, EN REVISIÓN |
| Incidencia como entidad funcional | CAP-01 v1.0, sección Incidencia |
| Persistencia mínima de Incidencia | INF-05 v1.2 e INF-06 v1.1 |
| Fecha de nacimiento, declaraciones y condiciones de alcohol | CAP-01 v1.0, INF-05 v1.2 e INF-06 v1.1 |
| Solicitudes históricas de recuperación de contraseña | CAP-01 v1.0, INF-05 v1.2 e INF-06 v1.1 |
| Administrador como rol sin tabla propia | INF-05 v1.2 e INF-06 v1.1 |
| Checkout e Idioma sin tabla independiente | CAP-01 v1.0, interpretados conforme a INF-05 v1.2 e INF-06 v1.1 |
| Solicitud de recuperación de contraseña con persistencia independiente | CAP-01 v1.0, representada por `solicitud_recuperacion_password` conforme a INF-05 v1.2 e INF-06 v1.1 |
| Pedido completo y SubPedidos por bodega | CAP-01 v1.0, INF-05 v1.2 e INF-06 v1.1 |

---

# CIERRE DEL DOCUMENTO

CAP-02 v1.1 consolida el modelo de datos funcional del MVP y mantiene la separación entre la experiencia comercial del comprador y la operación multi-bodega interna.

El modelo permite que una compra reúna vinos de distintas bodegas, cobre al comprador una sola vez, conserve trazabilidad económica y logística, y delegue en cada bodega la preparación y envío de sus productos.

El documento permanece **EN REVISIÓN** hasta la validación del CTO y la aprobación del CEO. Su aprobación no convierte automáticamente en ejecutables las reglas que INF-05 o INF-06 indiquen como dependientes de aplicación, triggers, jobs o servicios externos.
