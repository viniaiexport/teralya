# Teralya — CAP-08 — Criterios de Aceptación

## PORTADA

- **Documento:** CAP-08 — Criterios de Aceptación
- **Versión:** 1.2
- **Estado:** EN REVISIÓN
- **Fecha:** 13/07/2026
- **Autor:** Agente de Producto Teralya

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado | Descripción |
|---|---|---|---|---|
| 1.0 | 09/07/2026 | Arquitecto de Producto Teralya | INCOMPLETA | Archivo sin desarrollo de los criterios declarados. |
| 1.1 | 11/07/2026 | Agente de Producto Teralya | EN REVISIÓN | Reconstrucción desde CAP-07 v1.2 y fuentes funcionales vigentes. |
| 1.2 | 13/07/2026 | CTO + Agente de Producto | EN REVISIÓN | Alineación con CAP-02 v1.2, CAP-07 v1.2, INF-08 v2.3, ADR-001 y DLOG 0010/0014–0016. |

## OBJETIVO Y MÉTODO

Definir criterios verificables para HU-001 a HU-032 en formato DADO/CUANDO/ENTONCES. Cada bloque mantiene trazabilidad al módulo de CAP-03, flujo de CAP-04, pantalla de CAP-05 y Caso de Uso de CAP-06 ya asociados en CAP-07 v1.2. Se cubre el resultado principal y las alternativas relevantes sin añadir funcionalidad.

## COMPRADOR

### HU-001 — Registro de comprador

**CA-001.1 — Registro válido:** DADO un visitante sin cuenta con el mismo email, mayor de la edad mínima y con todos los datos y aceptaciones obligatorias, CUANDO envía el registro, ENTONCES el sistema crea su cuenta de comprador, inicia una sesión válida y permite continuar hacia Mi Cuenta o checkout.

**CA-001.2 — Edad o aceptación inválida:** DADO un visitante que no cumple la edad mínima o no acepta expresamente la declaración de mayoría de edad o las condiciones de compra de alcohol, CUANDO intenta registrarse, ENTONCES el sistema no crea la cuenta ni persiste datos de carrito.

**CA-001.3 — Idioma:** DADO el formulario de registro, CUANDO el navegador comunica un idioma disponible o el visitante elige otro idioma disponible, ENTONCES el sistema aplica ese idioma sin omitir validaciones; si no puede detectarlo, usa el idioma disponible por defecto.

**CA-001.4 — Acreditaciones:** DADO un registro completado correctamente, CUANDO se crea la cuenta, ENTONCES quedan asociados fecha de nacimiento, confirmación de mayoría de edad, aceptación, fecha/hora y versión de las condiciones de alcohol aceptadas.

**CA-001.5 — Fusión tras registro:** DADO un carrito local con líneas válidas e inválidas, CUANDO finaliza el registro, ENTONCES el sistema fusiona de forma idempotente las líneas válidas con el único carrito persistente activo, conserva una línea por vino, revalida precio/publicación/disponibilidad/cantidad, informa las descartadas y no crea carrito persistente anónimo.

**Trazabilidad:** CAP-07 v1.2 HU-001 · CU-001 · ADR-001 · DLOG 0010 · INF-08 v2.3.

### HU-002 — Inicio de sesión de comprador

**CA-002.1 — Acceso válido:** DADO un comprador con cuenta activa, CUANDO introduce credenciales correctas, ENTONCES el sistema inicia su sesión y lo dirige a Mi Cuenta o le permite continuar el checkout.

**CA-002.2 — Acceso inválido:** DADO credenciales incorrectas o una cuenta inactiva, CUANDO se intenta iniciar sesión, ENTONCES el sistema deniega el acceso, no muestra recursos privados y no modifica carritos.

**CA-002.3 — Fusión local:** DADO un comprador que inicia sesión con carrito local, CUANDO la autenticación concluye, ENTONCES las líneas válidas se fusionan de forma idempotente con su único carrito persistente activo, sin duplicar vinos; las inválidas se descartan e informan tras revalidar precio, publicación, disponibilidad y cantidad.

**CA-002.4 — Sin carrito local:** DADO un comprador que inicia sesión sin carrito local, CUANDO la autenticación concluye, ENTONCES conserva sin cambios su carrito persistente existente.

**Trazabilidad:** CAP-07 v1.2 HU-002 · CU-002 · ADR-001 · DLOG 0010 · INF-08 v2.3.

### HU-003 — Recuperación de contraseña

**CA-003.1 — Recuperación válida:** DADO un email asociado a una cuenta, CUANDO el usuario solicita recuperar el acceso y utiliza un enlace o token válido no expirado, ENTONCES puede definir una nueva contraseña válida e iniciar sesión con ella.

**CA-003.2 — Token inválido:** DADO un enlace o token inválido, usado o expirado, CUANDO se intenta definir una nueva contraseña, ENTONCES el sistema rechaza la operación y no modifica la contraseña.

**Trazabilidad:** HU-003 · CU-003 · FL-COM-003 · PT-ACC-004, PT-ACC-005 y PT-ACC-003 · Módulo 1.

### HU-004 — Consulta del catálogo

**CA-004.1 — Catálogo disponible:** DADO que existen vinos publicados y disponibles de bodegas validadas, CUANDO un visitante o comprador abre el catálogo, ENTONCES el sistema muestra exclusivamente esos vinos y permite acceder a sus fichas.

**CA-004.2 — Exclusión y vacío:** DADO un vino despublicado, no disponible o perteneciente a una bodega no validada, CUANDO se carga el catálogo, ENTONCES queda excluido; si no existe ningún vino elegible, se presenta el estado vacío.

**Trazabilidad:** CAP-07 v1.2 HU-004 · CU-004 · API-009 · INF-08 v2.3.

### HU-005 — Búsqueda y filtros

**CA-005.1 — Resultados coherentes:** DADO un catálogo con vinos publicados, CUANDO el usuario busca o aplica filtros válidos, ENTONCES el sistema muestra solo resultados que cumplen los criterios y conserva las reglas de publicación y disponibilidad.

**CA-005.2 — Sin resultados:** DADO una búsqueda o combinación válida sin coincidencias, CUANDO se ejecuta, ENTONCES el sistema muestra el estado sin resultados y permite limpiar los filtros.

**Trazabilidad:** HU-005 · CU-005 · FL-COM-005 · PT-PUB-002 y PT-PUB-003 · Módulo 5.

### HU-006 — Consulta de ficha de vino

**CA-006.1 — Ficha comprable:** DADO un vino publicado, disponible y perteneciente a una bodega validada, CUANDO el usuario abre su ficha, ENTONCES ve información comercial, precio, disponibilidad, bodega y la acción de añadir al carrito.

**CA-006.2 — Vino no disponible:** DADO un vino publicado sin disponibilidad, CUANDO se abre su ficha, ENTONCES se muestra como no disponible y no puede añadirse al carrito.

**CA-006.3 — Confianza de bodega:** DADO una ficha válida, CUANDO el usuario selecciona la bodega, ENTONCES accede a su ficha pública y a sus vinos publicados.

**Trazabilidad:** HU-006 · CU-006 · FL-COM-006 y FL-COM-007 · PT-PUB-003, PT-PUB-004 y PT-COM-002 · Módulos 6 y 7.

### HU-007 — Añadir vino al carrito

**CA-007.1 — Visitante local:** DADO un visitante y un vino publicado, disponible y de bodega validada, CUANDO añade una cantidad válida, ENTONCES la línea se crea o actualiza únicamente en el carrito local, se recalcula el total y no se crea ninguna fila persistente.

**CA-007.2 — Comprador persistente:** DADO un comprador autenticado y un vino válido, CUANDO añade una cantidad no superior a la disponible, ENTONCES el sistema crea o actualiza una única línea por vino en su carrito persistente activo y recalcula el total.

**CA-007.3 — Entrada inválida:** DADO una cantidad inválida, disponibilidad insuficiente, vino despublicado/no disponible o bodega no validada, CUANDO se intenta añadir, ENTONCES no se incorpora ni modifica la línea y se informa el impedimento.

**Trazabilidad:** CAP-07 v1.2 HU-007 · CU-007 · ADR-001 · API-011 · INF-08 v2.3.

### HU-008 — Gestión del carrito

**CA-008.1 — Gestión local:** DADO un visitante con carrito local, CUANDO modifica una cantidad válida, elimina una línea o vacía el carrito, ENTONCES el almacenamiento local y los totales quedan actualizados sin persistencia de servidor.

**CA-008.2 — Gestión persistente:** DADO un comprador autenticado con carrito persistente, CUANDO modifica una cantidad válida, elimina una línea o vacía el carrito, ENTONCES el contenido persistente y los totales quedan actualizados.

**CA-008.3 — Cambio de validez:** DADO una línea cuyo vino deja de cumplir publicación, disponibilidad, bodega validada o cantidad suficiente, CUANDO se revisa el carrito o se intenta avanzar, ENTONCES se identifica la línea inválida y se bloquea el checkout hasta eliminarla o corregirla.

**CA-008.4 — Resultado de fusión:** DADO una fusión tras registro o inicio de sesión, CUANDO finaliza, ENTONCES existe como máximo una línea por vino en el único carrito persistente activo y el carrito local procesado no produce duplicados en reintentos.

**Trazabilidad:** CAP-07 v1.2 HU-008 · CU-008 · ADR-001 · API-012 a API-015 · INF-08 v2.3.

### HU-009 — Checkout

**CA-009.1 — Preparación válida:** DADO un comprador autenticado, carrito activo no vacío con líneas válidas y direcciones propias, activas y válidas habilitadas para envío y facturación —que pueden ser la misma si admite ambos usos—, CUANDO confirma datos y resumen, ENTONCES el sistema congela líneas/precios/direcciones, calcula el total y crea un Pedido en `pendiente_pago`.

**CA-009.2 — Checkout inválido:** DADO sesión ausente, carrito vacío o inactivo, línea inválida o dirección de envío/facturación inexistente, ajena, inactiva o no habilitada para su uso, CUANDO intenta preparar el pago, ENTONCES no crea Pedido ni sesión Stripe y devuelve el impedimento verificable.

**CA-009.3 — Idempotencia por carrito:** DADO que un carrito ya originó un Pedido `pendiente_pago`, CUANDO se reintenta el checkout con el mismo carrito, ENTONCES se devuelve el mismo Pedido y no se crea un segundo Pedido.

**Trazabilidad:** CAP-07 v1.2 HU-009 · CU-009 · DLOG 0015/0016 · API-016 · INF-08 v2.3.

### HU-010 — Pago del Pedido

**CA-010.1 — Sesión única reutilizable:** DADO un Pedido `pendiente_pago` sin sesión Stripe activa, CUANDO se inicia el pago, ENTONCES se crea una sola sesión activa asociada; si ya existe una sesión activa, el reintento devuelve la misma URL sin crear otra sesión.

**CA-010.2 — Retorno no confirmatorio:** DADO cualquier retorno del navegador desde Stripe, CUANDO el comprador vuelve a Teralya, ENTONCES el retorno por sí solo no confirma el pago ni el Pedido.

**CA-010.3 — Confirmación autorizada:** DADO un webhook firmado, único, con pago aprobado e importe coincidente, CUANDO el sistema lo procesa, ENTONCES confirma económicamente mediante `pago.estado` y muestra la confirmación del Pedido.

**CA-010.4 — Pago no aprobado:** DADO pago rechazado, cancelado, interrumpido, importe discrepante o confirmación no firmada, CUANDO se procesa el resultado, ENTONCES el Pedido no queda confirmado.

**CA-010.5 — Reintento sin duplicados:** DADO una solicitud o evento ya procesado, CUANDO se reenvía, ENTONCES devuelve el resultado existente y no duplica pago, confirmación, Pedido ni SubPedidos.

**Trazabilidad:** CAP-07 v1.2 HU-010 · CU-010 · DLOG 0014/0016 · API-017/API-018 · INF-08 v2.3.

### HU-011 — Consulta de Pedidos

**CA-011.1 — Pedidos propios:** DADO un comprador autenticado con Pedidos, CUANDO abre el listado o detalle de uno propio, ENTONCES ve el Pedido completo, su estado global, líneas congeladas, bodegas, total y dirección correspondiente.

**CA-011.2 — Límite funcional:** DADO el detalle de un Pedido propio con varios SubPedidos, CUANDO el comprador lo consulta, ENTONCES puede ver la composición y estado global, pero no gestiona los SubPedidos como unidades independientes.

**CA-011.3 — Protección:** DADO un Pedido inexistente o ajeno, CUANDO el comprador solicita su detalle, ENTONCES el sistema no expone información y devuelve el resultado 404/403 aplicable.

**Trazabilidad:** CAP-07 v1.2 HU-011 · CU-011 · API-019/API-020 · INF-08 v2.3.

## BODEGA

### HU-012 — Solicitud de registro de bodega

**CA-012.1 — Solicitud válida:** DADO una bodega no registrada con email único, datos mínimos completos y condiciones aceptadas, CUANDO envía la solicitud, ENTONCES queda registrada como pendiente de validación y todavía no puede operar.

**CA-012.2 — Solicitud inválida:** DADO un email ya registrado, datos incompletos o condiciones no aceptadas, CUANDO se envía la solicitud, ENTONCES el sistema no la registra como válida e informa del error.

**Trazabilidad:** HU-012 · CU-012 · FL-BOD-001 · PT-ACC-002 y PT-ACC-003 · Módulo 8.

### HU-013 — Acceso de bodega validada

**CA-013.1 — Acceso válido:** DADO una bodega validada con cuenta activa, CUANDO inicia sesión con credenciales correctas, ENTONCES accede a su panel y solo a sus recursos.

**CA-013.2 — Bodega no validada:** DADO una bodega pendiente o no validada, CUANDO intenta operar, ENTONCES el sistema deniega el acceso operativo.

**Trazabilidad:** HU-013 · CU-013 · FL-BOD-003 · PT-ACC-003, PT-BOD-001 y PT-SIS-003 · Módulos 1 y 8.

### HU-014 — Perfil de bodega

**CA-014.1 — Guardado válido:** DADO una bodega autenticada y validada, CUANDO completa campos obligatorios con formatos válidos y guarda su perfil, ENTONCES el sistema actualiza su información propia y la hace disponible en la ficha pública aplicable.

**CA-014.2 — Datos inválidos:** DADO campos obligatorios incompletos o formatos inválidos, CUANDO se intenta guardar, ENTONCES el sistema no confirma la actualización e identifica los datos que deben corregirse.

**Trazabilidad:** HU-014 · CU-014 · FL-BOD-004 · PT-BOD-001, PT-BOD-002 y PT-PUB-004 · Módulo 9.

### HU-015 — Creación de vino

**CA-015.1 — Creación válida:** DADO una bodega autenticada y validada, CUANDO introduce datos obligatorios, precio y disponibilidad válidos, ENTONCES el sistema crea un vino propio no publicado en el estado inicial previo a `pendiente_revision`.

**CA-015.2 — Creación inválida:** DADO datos obligatorios incompletos, precio/disponibilidad inválidos o bodega no validada, CUANDO intenta crear el vino, ENTONCES no se crea ningún registro de vino y se identifican los campos o la condición inválida.

**Trazabilidad:** CAP-07 v1.2 HU-015 · CU-015 · API-007 · INF-08 v2.3.

### HU-016 — Edición de vino propio

**CA-016.1 — Edición válida:** DADO un vino perteneciente a la bodega autenticada y validada, CUANDO guarda cambios válidos, ENTONCES el sistema actualiza ese vino.

**CA-016.2 — Propiedad o datos inválidos:** DADO un vino ajeno o datos inválidos, CUANDO la bodega intenta guardarlos, ENTONCES el sistema deniega la operación o rechaza los cambios.

**Trazabilidad:** HU-016 · CU-016 · FL-BOD-006 · PT-BOD-003, PT-BOD-005 y PT-BOD-006 · Módulo 9.

### HU-017 — Solicitud de publicación

**CA-017.1 — Envío a revisión:** DADO un vino propio no publicado, completo, con precio y disponibilidad válidos, de una bodega validada, CUANDO la bodega solicita publicación, ENTONCES cambia exactamente a `pendiente_revision` y no queda publicado.

**CA-017.2 — Solicitud bloqueada:** DADO un vino incompleto, ajeno, con precio/disponibilidad inválidos, ya publicado o ya en `pendiente_revision`, CUANDO se solicita publicación, ENTONCES el estado no cambia y se devuelve el impedimento aplicable.

**Trazabilidad:** CAP-07 v1.2 HU-017 · CU-017 · API-034 · INF-08 v2.3.

### HU-018 — Consulta de SubPedidos propios

**CA-018.1 — Consulta autorizada:** DADO una bodega autenticada y validada con SubPedidos asignados, CUANDO abre listado o detalle, ENTONCES ve únicamente sus SubPedidos y los datos de envío necesarios para cumplirlos.

**CA-018.2 — Límite de acceso:** DADO un Pedido global o un SubPedido de otra bodega, CUANDO intenta consultarlo como unidad operativa, ENTONCES el sistema no muestra el Pedido completo ni el SubPedido ajeno.

**Trazabilidad:** CAP-07 v1.2 HU-018 · CU-018 · API-021/API-022 · INF-08 v2.3.

### HU-019 — Cambio de estado de SubPedido

**CA-019.1 — Transición válida:** DADO un SubPedido propio y una transición logística permitida, CUANDO la bodega confirma el nuevo estado, ENTONCES actualiza únicamente `subpedido.estado`, fuente logística persistente, y activa el recálculo global.

**CA-019.2 — Transición no permitida:** DADO un SubPedido ajeno o una transición inválida, CUANDO se intenta cambiar el estado, ENTONCES no se modifica el SubPedido ni el Pedido global.

**CA-019.3 — Sin edición global directa:** DADO una bodega autenticada, CUANDO intenta modificar directamente el estado global del Pedido, ENTONCES el sistema deniega la operación.

**Trazabilidad:** CAP-07 v1.2 HU-019 · CU-019 · DLOG 0014 · API-023 · INF-08 v2.3.

## ADMINISTRADOR

### HU-020 — Acceso administrativo

**CA-020.1 — Acceso válido:** DADO un usuario administrador con cuenta y permisos activos, CUANDO inicia sesión correctamente, ENTONCES accede al dashboard administrativo.

**CA-020.2 — Rol no autorizado:** DADO un usuario sin rol administrativo o sin permisos activos, CUANDO intenta acceder al área administrativa, ENTONCES el sistema deniega el acceso.

**Trazabilidad:** HU-020 · CU-020 · FL-ADM-001 · PT-ACC-003, PT-ADM-001 y PT-SIS-003 · Módulo 1.

### HU-021 — Validación de bodega

**CA-021.1 — Consulta previa:** DADO un administrador autorizado, CUANDO consulta solicitudes, ENTONCES puede listar y abrir el detalle de bodegas pendientes sin modificar su estado.

**CA-021.2 — Validación:** DADO una solicitud exactamente pendiente con datos mínimos suficientes, CUANDO el administrador la valida, ENTONCES la bodega cambia a validada y queda habilitada para acceso operativo.

**CA-021.3 — Estado o datos inválidos:** DADO una solicitud ya validada/no pendiente o con información insuficiente, CUANDO se intenta validar, ENTONCES el estado no cambia y se devuelve 409 o el error de validación aplicable.

**Trazabilidad:** CAP-07 v1.2 HU-021 · CU-021 · API-024/API-035/API-036 · INF-08 v2.3.

### HU-022 — Revisión de vino

**CA-022.1 — Revisión disponible:** DADO un vino exactamente en `pendiente_revision` de una bodega validada, CUANDO el administrador abre su detalle, ENTONCES puede comprobar integridad, precio, disponibilidad e imágenes antes de decidir.

**CA-022.2 — Vino no apto:** DADO un vino fuera de `pendiente_revision`, incompleto, con precio/disponibilidad inválidos, sin imagen o cuya bodega no está validada, CUANDO se revisa, ENTONCES no puede considerarse apto para publicación.

**Trazabilidad:** CAP-07 v1.2 HU-022 · CU-022 · API-037 · INF-08 v2.3.

### HU-023 — Publicación de vino

**CA-023.1 — Publicación válida:** DADO un vino exactamente en `pendiente_revision`, completo, con precio y disponibilidad válidos, al menos una imagen y bodega propietaria validada, CUANDO el administrador confirma, ENTONCES cambia a publicado y aparece como comprable en catálogo, búsqueda y ficha mientras conserve disponibilidad.

**CA-023.2 — Publicación bloqueada:** DADO un vino en cualquier otro estado, incompleto, sin imagen, con precio/disponibilidad inválidos o de bodega no validada, CUANDO se intenta publicar, ENTONCES el estado no cambia y el vino no aparece como comprable.

**Trazabilidad:** CAP-07 v1.2 HU-023 · CU-023 · API-025 · INF-08 v2.3.

### HU-024 — Despublicación de vino

**CA-024.1 — Despublicación:** DADO un vino publicado, CUANDO el administrador confirma su despublicación, ENTONCES deja de mostrarse como comprable y no puede añadirse al carrito.

**CA-024.2 — Conservación histórica:** DADO un vino despublicado incluido en Pedidos anteriores, CUANDO se consultan esos Pedidos, ENTONCES el histórico permanece disponible.

**Trazabilidad:** HU-024 · CU-024 · FL-ADM-007 · PT-ADM-004, PT-ADM-005 y PT-PUB-002 · Módulo 10.

### HU-025 — Consulta administrativa de Pedidos

**CA-025.1 — Consulta completa:** DADO un administrador autorizado, CUANDO consulta el listado o detalle de Pedidos, ENTONCES ve los Pedidos completos y sus SubPedidos como información operativa interna.

**CA-025.2 — Pedido inexistente:** DADO un identificador inexistente, CUANDO solicita el detalle, ENTONCES el sistema muestra el estado no encontrado sin crear ni modificar información.

**Trazabilidad:** HU-025 · CU-025 · FL-ADM-008 y FL-ADM-009 · PT-ADM-001, PT-ADM-006 y PT-ADM-007 · Módulo 10.

### HU-026 — Dashboard administrativo

**CA-026.1 — Indicadores mínimos:** DADO un administrador autorizado, CUANDO abre el dashboard, ENTONCES el sistema muestra únicamente ventas del día y pedidos pendientes como indicadores del MVP.

**CA-026.2 — Acceso a pendientes:** DADO que existen pedidos pendientes, CUANDO selecciona el indicador, ENTONCES accede directamente al listado correspondiente; si no existen, se muestra el estado vacío aplicable.

**Trazabilidad:** HU-026 · CU-026 · FL-ADM-002 y FL-ADM-003 · PT-ADM-001 y PT-ADM-006 · Módulo 10.

### HU-027 — Gestión de incidencia

**CA-027.1 — Consulta:** DADO un administrador autorizado, CUANDO lista o abre una incidencia, ENTONCES ve su estado, detalle y al menos una asociación válida a Pedido, SubPedido, Bodega o Vino sin modificarla.

**CA-027.2 — Transición válida:** DADO una incidencia existente, CUANDO aplica el siguiente paso exacto `abierta → en_revision → resuelta → cerrada` con la información requerida, ENTONCES el estado se actualiza y se genera automáticamente el evento de Auditoría.

**CA-027.3 — Salto o reapertura:** DADO una transición que salta estados, retrocede o reabre una incidencia cerrada, CUANDO se intenta guardar, ENTONCES se rechaza sin mutación ni evento de cambio exitoso.

**CA-027.4 — Asociación obligatoria:** DADO una incidencia sin asociación a Pedido, SubPedido, Bodega o Vino, CUANDO se intenta crear o consolidar, ENTONCES se rechaza por integridad.

**Trazabilidad:** CAP-07 v1.2 HU-027 · CU-027 · DLOG 0015 · API-040/API-041/API-042 · INF-08 v2.3.

## SISTEMA

### HU-028 — Confirmación de Pedido tras el pago

**CA-028.1 — Confirmación válida:** DADO un Pedido `pendiente_pago` y un evento Stripe firmado, único, aprobado y con importe coincidente, CUANDO se procesa, ENTONCES se actualiza `pago.estado` como única fuente económica, se confirma el flujo del Pedido y se habilita la generación atómica de SubPedidos.

**CA-028.2 — Confirmación inválida:** DADO firma inválida, evento repetido no previamente exitoso, pago no aprobado, importe discrepante o Pedido inexistente, CUANDO se procesa, ENTONCES no se confirma económicamente ni se generan SubPedidos.

**CA-028.3 — Idempotencia del evento:** DADO un identificador de evento Stripe ya procesado con éxito, CUANDO se reenvía, ENTONCES se devuelve el resultado existente sin segundo efecto sobre Pago, Pedido, stock o SubPedidos.

**CA-028.4 — Datos congelados:** DADO la primera confirmación válida, CUANDO finaliza, ENTONCES líneas, precios y direcciones congelados del Pedido permanecen inmutables frente a cambios posteriores del catálogo o perfil.

**Trazabilidad:** CAP-07 v1.2 HU-028 · CU-028 · DLOG 0014/0016 · API-018 · INF-08 v2.3.

### HU-029 — Generación de SubPedidos

**CA-029.1 — División exacta:** DADO un Pedido confirmado con líneas de una o varias bodegas válidas, CUANDO se generan SubPedidos, ENTONCES existe exactamente un SubPedido por combinación Pedido–Bodega, cada uno contiene solo líneas de esa bodega y todos conservan el mismo Pedido/Pago origen.

**CA-029.2 — Atomicidad:** DADO una línea sin vino/bodega válida o cualquier fallo durante la división, CUANDO se ejecuta, ENTONCES no queda una creación parcial de SubPedidos.

**CA-029.3 — Reintento:** DADO que los SubPedidos ya fueron generados, CUANDO se reintenta la operación o se reenvía el webhook, ENTONCES no se crea ningún duplicado y se devuelve el resultado existente.

**Trazabilidad:** CAP-07 v1.2 HU-029 · CU-029 · DLOG 0016 · integridad única Pedido–Bodega · INF-08 v2.3.

### HU-030 — Recálculo del estado global

**CA-030.1 — Fuente logística:** DADO una actualización válida de un SubPedido, CUANDO queda guardada, ENTONCES el sistema evalúa el conjunto completo de `subpedido.estado` y deriva el estado global del Pedido conforme a la regla de agregación vigente.

**CA-030.2 — Sin escritura logística duplicada:** DADO una bodega o petición que intenta escribir directamente el estado global del Pedido, CUANDO se procesa, ENTONCES se rechaza y el valor global solo puede cambiar por recálculo derivado.

**CA-030.3 — Inconsistencia:** DADO transición inválida, SubPedido/Pedido inexistente o relación inconsistente, CUANDO se solicita actualizar, ENTONCES no se modifica `subpedido.estado` ni el estado global.

**Trazabilidad:** CAP-07 v1.2 HU-030 · CU-030 · DLOG 0014 · API-023 · INF-08 v2.3.

### HU-031 — Control de acceso por rol

**CA-031.1 — Acceso permitido:** DADO una sesión activa, rol y permisos válidos, y cuando aplica una asociación usuario–bodega validada y propiedad del recurso, CUANDO se solicita, ENTONCES el sistema permite únicamente la operación autorizada.

**CA-031.2 — Acceso denegado:** DADO sesión ausente/expirada, rol no autorizado, bodega no validada, ausencia de asociación usuario–bodega o recurso ajeno, CUANDO se solicita acceso, ENTONCES se bloquea sin exponer información protegida ni mutar el recurso.

**Trazabilidad:** CAP-07 v1.2 HU-031 · CU-031 · regla transversal de acceso · INF-08 v2.3.

### HU-032 — Recursos no disponibles o no encontrados

**CA-032.1 — Recurso válido:** DADO un recurso existente, disponible y autorizado, CUANDO se solicita, ENTONCES el sistema lo muestra conforme al rol y sin efectos laterales no solicitados.

**CA-032.2 — Recurso inexistente o no autorizado:** DADO un identificador inexistente o un recurso ajeno/no autorizado, CUANDO se solicita, ENTONCES devuelve 404 o 403 según el contrato, no expone datos protegidos y no realiza mutaciones.

**CA-032.3 — Recurso no disponible:** DADO un vino despublicado/no disponible u otro conflicto de estado, CUANDO se intenta una acción incompatible, ENTONCES devuelve 404 o 409 según el endpoint y la acción no se ejecuta.

**CA-032.4 — Error de pago:** DADO un error durante el pago o ausencia de webhook válido, CUANDO se presenta el resultado, ENTONCES muestra un mensaje comprensible y no confirma `pago.estado`, Pedido ni SubPedidos.

**Trazabilidad:** CAP-07 v1.2 HU-032 · CU-032 · regla transversal de respuestas 403/404/409 · INF-08 v2.3.

## MATRIZ RESUMEN

| Rango | Actor | Historias | Criterios | Fuentes principales |
|---|---|---:|---:|---|
| HU-001 a HU-011 | Comprador | 11 | 36 | CU-001 a CU-011 |
| HU-012 a HU-019 | Bodega | 8 | 17 | CU-012 a CU-019 |
| HU-020 a HU-027 | Administrador | 8 | 19 | CU-020 a CU-027 |
| HU-028 a HU-032 | Sistema | 5 | 16 | CU-028 a CU-032 |
| **Total** |  | **32** | **88** | **CU-001 a CU-032** |

## OBSERVACIONES DE REVISIÓN

1. Los 88 criterios cubren las 32 historias aprobadas sin forzar una relación de un único criterio por historia.
2. La reconstrucción incorpora carrito visitante local y fusión, idempotencia de checkout/Stripe, fuentes de verdad económicas y logísticas, publicación controlada, incidencias e integridad de SubPedidos.
3. No se añaden rendimiento, diseño visual, analítica avanzada, logística avanzada, facturación avanzada ni funciones excluidas del MVP.
4. La aprobación requiere trazabilidad coherente con CAP-02 v1.2, CAP-07 v1.2, INF-08 v2.3, ADR-001 y DLOG 0010/0014–0016.

## CIERRE

CAP-08 v1.2 queda completo en estado **EN REVISIÓN**, con 88 criterios verificables para HU-001 a HU-032 y trazabilidad hacia las fuentes oficiales vigentes.
