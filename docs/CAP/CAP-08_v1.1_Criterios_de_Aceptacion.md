# Teralya — CAP-08 — Criterios de Aceptación

## PORTADA

- **Documento:** CAP-08 — Criterios de Aceptación
- **Versión:** 1.1
- **Estado:** EN REVISIÓN
- **Fecha:** 11/07/2026
- **Autor:** Agente de Producto Teralya

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado | Descripción |
|---|---|---|---|---|
| 1.0 | 09/07/2026 | Arquitecto de Producto Teralya | INCOMPLETA | Archivo sin desarrollo de los criterios declarados. |
| 1.1 | 11/07/2026 | Agente de Producto Teralya | EN REVISIÓN | Reconstrucción desde CAP-07 v1.1 y fuentes funcionales vigentes. |

## OBJETIVO Y MÉTODO

Definir criterios verificables para HU-001 a HU-032 en formato DADO/CUANDO/ENTONCES. Cada bloque mantiene trazabilidad al módulo de CAP-03, flujo de CAP-04, pantalla de CAP-05 y Caso de Uso de CAP-06 ya asociados en CAP-07 v1.1. Se cubre el resultado principal y las alternativas relevantes sin añadir funcionalidad.

## COMPRADOR

### HU-001 — Registro de comprador

**CA-001.1 — Registro válido:** DADO un visitante sin cuenta con el mismo email, mayor de la edad mínima y con todos los datos y aceptaciones obligatorias, CUANDO envía el registro, ENTONCES el sistema crea su cuenta de comprador y permite iniciar sesión o continuar el checkout si procede.

**CA-001.2 — Edad o aceptación inválida:** DADO un visitante que no cumple la edad mínima o no acepta la declaración de mayoría de edad o las condiciones de compra de alcohol, CUANDO intenta registrarse, ENTONCES el sistema no crea la cuenta e informa del impedimento.

**CA-001.3 — Idioma:** DADO el formulario de registro, CUANDO el navegador comunica un idioma disponible o el visitante elige manualmente otro idioma disponible, ENTONCES el sistema presenta y aplica ese idioma sin omitir ninguna validación obligatoria; si no puede detectarlo, usa el idioma disponible por defecto.

**CA-001.4 — Conservación de acreditaciones:** DADO un registro de comprador completado correctamente, CUANDO el sistema crea la cuenta, ENTONCES conserva asociadas al comprador su fecha de nacimiento, la confirmación de mayoría de edad, la aceptación de las condiciones de compra de alcohol y la fecha de dicha aceptación.

**Trazabilidad:** CAP-07 HU-001 · CAP-06 CU-001 · CAP-04 FL-COM-001 y FL-SIS-001 · CAP-05 PT-ACC-001, PT-ACC-003 y PT-COM-003 · CAP-03 Módulos 2 y 3 · CAP-01 entidad Comprador, apartado «Información que almacena» · INF-08 API-001, parámetros, validaciones y observación de auditoría.

### HU-002 — Inicio de sesión de comprador

**CA-002.1 — Acceso válido:** DADO un comprador con cuenta activa, CUANDO introduce credenciales correctas, ENTONCES el sistema inicia su sesión y lo dirige a Mi Cuenta o le permite continuar el checkout.

**CA-002.2 — Acceso inválido:** DADO credenciales incorrectas o una cuenta inactiva, CUANDO se intenta iniciar sesión, ENTONCES el sistema deniega el acceso sin mostrar recursos privados.

**Trazabilidad:** HU-002 · CU-002 · FL-COM-002 · PT-ACC-003, PT-COM-001 y PT-COM-003 · Módulo 1.

### HU-003 — Recuperación de contraseña

**CA-003.1 — Recuperación válida:** DADO un email asociado a una cuenta, CUANDO el usuario solicita recuperar el acceso y utiliza un enlace o token válido no expirado, ENTONCES puede definir una nueva contraseña válida e iniciar sesión con ella.

**CA-003.2 — Token inválido:** DADO un enlace o token inválido, usado o expirado, CUANDO se intenta definir una nueva contraseña, ENTONCES el sistema rechaza la operación y no modifica la contraseña.

**Trazabilidad:** HU-003 · CU-003 · FL-COM-003 · PT-ACC-004, PT-ACC-005 y PT-ACC-003 · Módulo 1.

### HU-004 — Consulta del catálogo

**CA-004.1 — Catálogo disponible:** DADO que existen vinos publicados de bodegas validadas, CUANDO un visitante o comprador abre el catálogo, ENTONCES el sistema muestra esos vinos y permite acceder a sus fichas.

**CA-004.2 — Exclusión y vacío:** DADO que un vino está despublicado, pertenece a una bodega no validada o no existen vinos publicables, CUANDO se carga el catálogo, ENTONCES el vino no se muestra como comprable y se presenta el estado vacío cuando corresponda.

**Trazabilidad:** HU-004 · CU-004 · FL-COM-004 · PT-PUB-001 y PT-PUB-002 · Módulo 4.

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

**CA-007.1 — Cantidad válida:** DADO un vino publicado y disponible de una bodega validada, CUANDO el usuario añade una cantidad no superior a la disponible, ENTONCES el sistema incorpora o actualiza la línea y recalcula el total.

**CA-007.2 — Cantidad o vino inválido:** DADO una cantidad inválida, disponibilidad insuficiente o un vino despublicado, CUANDO se intenta añadir, ENTONCES el sistema no incorpora la cantidad inválida e informa del problema.

**Trazabilidad:** HU-007 · CU-007 · FL-COM-008 · PT-PUB-002, PT-PUB-003, PT-PUB-004 y PT-COM-002 · Módulo 11.

### HU-008 — Gestión del carrito

**CA-008.1 — Actualización:** DADO un carrito con líneas válidas, CUANDO el usuario modifica una cantidad válida o elimina una línea, ENTONCES el sistema actualiza el contenido y recalcula el total.

**CA-008.2 — Cambio de disponibilidad:** DADO un vino del carrito que deja de estar disponible o cuya cantidad ya no es suficiente, CUANDO se revisa el carrito o se intenta avanzar, ENTONCES el sistema informa y bloquea el checkout con esa línea inválida.

**Trazabilidad:** HU-008 · CU-008 · FL-COM-009 · PT-COM-002 y PT-COM-003 · Módulo 11.

### HU-009 — Checkout

**CA-009.1 — Preparación válida:** DADO un comprador autenticado, un carrito válido y una dirección completa y válida, CUANDO confirma los datos y el resumen, ENTONCES el sistema calcula el total correcto y prepara el Pedido para pago.

**CA-009.2 — Checkout inválido:** DADO un usuario no autenticado, carrito vacío, datos incompletos, dirección inválida o un vino no disponible, CUANDO intenta iniciar el pago, ENTONCES el sistema no crea la sesión de pago y solicita resolver el impedimento.

**Trazabilidad:** HU-009 · CU-009 · FL-COM-010 · PT-COM-003, PT-ACC-003, PT-ACC-001 y PT-COM-004 · Módulo 11.

### HU-010 — Pago del Pedido

**CA-010.1 — Pago aprobado:** DADO un Pedido correctamente preparado, CUANDO el comprador completa Stripe Checkout y Stripe confirma el pago, ENTONCES el sistema confirma el Pedido y muestra su confirmación.

**CA-010.2 — Pago no aprobado:** DADO un pago rechazado, cancelado, interrumpido o sin confirmación válida de Stripe, CUANDO el comprador vuelve a Teralya, ENTONCES el sistema no confirma el Pedido.

**Trazabilidad:** HU-010 · CU-010 · FL-COM-011 · PT-COM-004, PT-COM-005 y PT-COM-003 · Módulo 11.

### HU-011 — Consulta de Pedidos

**CA-011.1 — Pedidos propios:** DADO un comprador autenticado con Pedidos, CUANDO abre Mis pedidos o el detalle de uno propio, ENTONCES ve el listado o Pedido completo con su estado global, líneas, bodegas, total y dirección correspondiente.

**CA-011.2 — Protección:** DADO un Pedido inexistente o ajeno, CUANDO el comprador solicita su detalle, ENTONCES el sistema no muestra la información y devuelve el estado de no encontrado o no autorizado aplicable.

**Trazabilidad:** HU-011 · CU-011 · FL-COM-012, FL-COM-013 y FL-COM-014 · PT-COM-001, PT-COM-006, PT-COM-007 y PT-COM-005 · Módulo 11.

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

**CA-015.1 — Creación válida:** DADO una bodega autenticada y validada, CUANDO introduce los datos obligatorios, precio y disponibilidad válidos, ENTONCES el sistema crea el vino como propio y no publicado.

**CA-015.2 — Creación inválida:** DADO datos incompletos, precio o disponibilidad inválidos, CUANDO intenta crear el vino, ENTONCES el sistema no guarda un vino válido para publicación y muestra los errores.

**Trazabilidad:** HU-015 · CU-015 · FL-BOD-005 · PT-BOD-001, PT-BOD-003, PT-BOD-004 y PT-BOD-006 · Módulo 9.

### HU-016 — Edición de vino propio

**CA-016.1 — Edición válida:** DADO un vino perteneciente a la bodega autenticada y validada, CUANDO guarda cambios válidos, ENTONCES el sistema actualiza ese vino.

**CA-016.2 — Propiedad o datos inválidos:** DADO un vino ajeno o datos inválidos, CUANDO la bodega intenta guardarlos, ENTONCES el sistema deniega la operación o rechaza los cambios.

**Trazabilidad:** HU-016 · CU-016 · FL-BOD-006 · PT-BOD-003, PT-BOD-005 y PT-BOD-006 · Módulo 9.

### HU-017 — Solicitud de publicación

**CA-017.1 — Envío a revisión:** DADO un vino propio completo, con precio y disponibilidad válidos, de una bodega validada, CUANDO solicita su publicación, ENTONCES el sistema lo marca como pendiente de revisión administrativa sin publicarlo directamente.

**CA-017.2 — Solicitud bloqueada:** DADO un vino incompleto, ajeno o con precio o disponibilidad inválidos, CUANDO se solicita publicar, ENTONCES el sistema no lo envía válidamente a revisión e informa del impedimento.

**Trazabilidad:** HU-017 · CU-017 · FL-BOD-007 · PT-BOD-003, PT-BOD-005, PT-BOD-006 y PT-ADM-004 · Módulo 9.

### HU-018 — Consulta de SubPedidos propios

**CA-018.1 — Consulta autorizada:** DADO una bodega autenticada y validada con SubPedidos asignados, CUANDO abre el listado o detalle, ENTONCES ve únicamente sus SubPedidos y los datos de envío necesarios para cumplirlos.

**CA-018.2 — Acceso ajeno:** DADO un SubPedido de otra bodega, CUANDO intenta consultarlo, ENTONCES el sistema no muestra su información.

**Trazabilidad:** HU-018 · CU-018 · FL-BOD-008 y FL-BOD-009 · PT-BOD-001, PT-BOD-007 y PT-BOD-008 · Módulos 9 y 11.

### HU-019 — Cambio de estado de SubPedido

**CA-019.1 — Transición válida:** DADO un SubPedido propio y una transición permitida, CUANDO la bodega confirma el nuevo estado, ENTONCES el sistema actualiza el SubPedido y activa el recálculo global cuando corresponda.

**CA-019.2 — Transición no permitida:** DADO un SubPedido ajeno o una transición no aprobada, CUANDO se intenta cambiar el estado, ENTONCES el sistema rechaza la operación y no modifica el Pedido global.

**Trazabilidad:** HU-019 · CU-019 · FL-BOD-010 y FL-SIS-005 · PT-BOD-007, PT-BOD-008, PT-COM-007 y PT-ADM-007 · Módulo 11.

## ADMINISTRADOR

### HU-020 — Acceso administrativo

**CA-020.1 — Acceso válido:** DADO un usuario administrador con cuenta y permisos activos, CUANDO inicia sesión correctamente, ENTONCES accede al dashboard administrativo.

**CA-020.2 — Rol no autorizado:** DADO un usuario sin rol administrativo o sin permisos activos, CUANDO intenta acceder al área administrativa, ENTONCES el sistema deniega el acceso.

**Trazabilidad:** HU-020 · CU-020 · FL-ADM-001 · PT-ACC-003, PT-ADM-001 y PT-SIS-003 · Módulo 1.

### HU-021 — Validación de bodega

**CA-021.1 — Validación:** DADO una solicitud pendiente con datos mínimos suficientes, CUANDO el administrador la valida, ENTONCES el sistema cambia la bodega a validada y habilita su acceso operativo.

**CA-021.2 — Datos insuficientes:** DADO una solicitud con información insuficiente, CUANDO el administrador intenta validarla, ENTONCES la bodega no queda habilitada.

**Trazabilidad:** HU-021 · CU-021 · FL-BOD-002 y FL-ADM-004 · PT-ADM-001, PT-ADM-002 y PT-ADM-003 · Módulos 8 y 10.

### HU-022 — Revisión de vino

**CA-022.1 — Revisión disponible:** DADO un vino pendiente de una bodega validada, CUANDO el administrador abre su detalle, ENTONCES puede comprobar información obligatoria, precio y disponibilidad antes de decidir.

**CA-022.2 — Vino no apto:** DADO un vino incompleto o cuya bodega no está validada, CUANDO se revisa, ENTONCES el sistema no permite considerarlo apto para publicación.

**Trazabilidad:** HU-022 · CU-022 · FL-ADM-005 · PT-ADM-001, PT-ADM-004 y PT-ADM-005 · Módulo 10.

### HU-023 — Publicación de vino

**CA-023.1 — Publicación válida:** DADO un vino completo, con precio y disponibilidad válidos, de una bodega validada, CUANDO el administrador confirma su publicación, ENTONCES aparece en catálogo, búsqueda y ficha pública como comprable mientras conserve disponibilidad.

**CA-023.2 — Publicación bloqueada:** DADO que falta alguna condición obligatoria, CUANDO se intenta publicar, ENTONCES el sistema no cambia el vino a publicado.

**Trazabilidad:** HU-023 · CU-023 · FL-ADM-006 · PT-ADM-004, PT-ADM-005, PT-PUB-002 y PT-PUB-003 · Módulo 10.

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

**CA-027.1 — Actualización válida:** DADO una incidencia existente y una transición permitida, CUANDO el administrador actualiza su estado con la información mínima requerida, ENTONCES el sistema guarda el cambio.

**CA-027.2 — Cierre inválido:** DADO información insuficiente o una transición no permitida, CUANDO se intenta actualizar o cerrar la incidencia, ENTONCES el sistema rechaza esa transición.

**Trazabilidad:** HU-027 · CU-027 · FL-ADM-010 · PT-ADM-008, PT-ADM-009 y PT-ADM-007 · Módulo 10.

## SISTEMA

### HU-028 — Confirmación de Pedido tras el pago

**CA-028.1 — Confirmación válida:** DADO un Pedido preparado y una confirmación válida de Stripe con pago aprobado e importe coincidente, CUANDO el sistema procesa la confirmación, ENTONCES marca el pago y el Pedido como confirmados y habilita la generación de SubPedidos.

**CA-028.2 — Confirmación inválida:** DADO una confirmación ausente o inválida, pago no aprobado, importe no coincidente o Pedido no encontrado, CUANDO se procesa el resultado, ENTONCES el sistema no confirma el Pedido.

**Trazabilidad:** HU-028 · CU-028 · FL-SIS-003 y FL-COM-011 · PT-COM-004, PT-COM-005, PT-COM-006 y PT-COM-007 · Módulo 11.

### HU-029 — Generación de SubPedidos

**CA-029.1 — División por bodega:** DADO un Pedido confirmado con líneas asociadas a bodegas válidas, CUANDO se generan los SubPedidos, ENTONCES el sistema agrupa las líneas por bodega, crea un SubPedido por cada una y lo asocia al Pedido y a la bodega correcta.

**CA-029.2 — Pedido no confirmado:** DADO un Pedido no confirmado o una línea sin vino o bodega válidos, CUANDO se intenta generar SubPedidos, ENTONCES el sistema no completa una división inconsistente.

**Trazabilidad:** HU-029 · CU-029 · FL-SIS-004 · PT-COM-005, PT-BOD-007, PT-BOD-008 y PT-ADM-007 · Módulo 11.

### HU-030 — Recálculo del estado global

**CA-030.1 — Recálculo:** DADO una actualización válida de un SubPedido asociado a un Pedido, CUANDO queda guardada, ENTONCES el sistema evalúa todos los SubPedidos y recalcula el estado global cuando corresponda.

**CA-030.2 — Inconsistencia:** DADO un SubPedido o Pedido asociado inexistente, una transición inválida o una relación inconsistente, CUANDO se solicita la actualización, ENTONCES el sistema no guarda un estado global incoherente.

**Trazabilidad:** HU-030 · CU-030 · FL-SIS-005 · PT-BOD-008, PT-COM-007 y PT-ADM-007 · Módulo 11.

### HU-031 — Control de acceso por rol

**CA-031.1 — Acceso permitido:** DADO un usuario autenticado con rol, permisos y propiedad válidos sobre el recurso, CUANDO lo solicita, ENTONCES el sistema permite el acceso correspondiente.

**CA-031.2 — Acceso denegado:** DADO una sesión ausente o expirada, rol no autorizado, bodega no validada o recurso ajeno, CUANDO se solicita acceso, ENTONCES el sistema lo bloquea y no expone información protegida.

**Trazabilidad:** HU-031 · CU-031 · FL-SIS-002 · PT-ACC-003, PT-SIS-003, PT-COM-001, PT-BOD-001 y PT-ADM-001 · Módulo 1.

### HU-032 — Recursos no disponibles o no encontrados

**CA-032.1 — Recurso válido:** DADO un recurso existente, disponible y autorizado, CUANDO se solicita, ENTONCES el sistema lo muestra según el rol del usuario.

**CA-032.2 — Recurso inválido:** DADO un recurso inexistente, despublicado, no disponible o no autorizado, CUANDO se solicita, ENTONCES el sistema muestra el estado de error, no encontrado o acceso no autorizado que corresponda, sin permitir una acción inválida.

**CA-032.3 — Error de pago:** DADO un error durante el pago, CUANDO el sistema gestiona el error general, ENTONCES muestra un mensaje comprensible y no confirma el Pedido.

**Trazabilidad:** HU-032 · CU-032 · FL-SIS-006 y FL-SIS-007 · PT-SIS-001, PT-SIS-002 y PT-SIS-003 · Módulos 1, 4, 6 y 10 según el recurso.

## MATRIZ RESUMEN

| Rango | Actor | Historias | Criterios | Fuentes principales |
|---|---|---:|---:|---|
| HU-001 a HU-011 | Comprador | 11 | 25 | CU-001 a CU-011 |
| HU-012 a HU-019 | Bodega | 8 | 16 | CU-012 a CU-019 |
| HU-020 a HU-027 | Administrador | 8 | 16 | CU-020 a CU-027 |
| HU-028 a HU-032 | Sistema | 5 | 11 | CU-028 a CU-032 |
| **Total** |  | **32** | **68** | **CU-001 a CU-032** |

## OBSERVACIONES DE REVISIÓN

1. Los 68 criterios se distribuyen entre 32 historias; no se fuerza una relación de un único criterio por historia porque ello omitiría alternativas y controles obligatorios.
2. Los criterios de incidencia están respaldados por CAP-03 Módulo 10, CAP-04 FL-ADM-010, CAP-05 PT-ADM-008/PT-ADM-009 y CAP-06 CU-027.
3. No se han añadido criterios de rendimiento, diseño visual, analítica avanzada, logística avanzada, facturación avanzada ni otras funciones excluidas del MVP.
4. La aprobación de este documento deberá comprobar que cada criterio es implementable y comprobable sin alterar las decisiones funcionales vigentes.

## CIERRE

CAP-08 v1.1 queda completo en estado **EN REVISIÓN**, con cobertura verificable para HU-001 a HU-032 y trazabilidad hacia las fuentes funcionales oficiales.
