# Teralya — CAP-07 — Historias de Usuario

## PORTADA

- **Documento:** CAP-07 — Historias de Usuario
- **Versión:** 1.2
- **Estado:** EN REVISIÓN
- **Fecha:** 13/07/2026
- **Autor:** CTO Teralya

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado | Descripción |
|---|---|---|---|---|
| 1.0 | 09/07/2026 | Arquitecto de Producto Teralya | INCOMPLETA | Archivo sin desarrollo de las historias declaradas. |
| 1.1 | 11/07/2026 | Agente de Producto Teralya | SUSTITUIDA | Reconstrucción trazable inicial de las 32 historias. |
| 1.2 | 13/07/2026 | CTO Teralya | EN REVISIÓN | Alineación con ADR-001, DLOG 0010/0014–0016, CAP-02 v1.2 e INF-08 v2.2. |

## OBJETIVO

Definir las Historias de Usuario del MVP de Teralya sin ampliar el alcance funcional aprobado. Cada historia deriva de un Caso de Uso de CAP-06, incorpora las decisiones posteriores aprobadas y conserva trazabilidad hacia el módulo de CAP-03, el flujo de CAP-04 y las pantallas de CAP-05 que la materializan.

## CRITERIO DE RECONSTRUCCIÓN Y CONTEO REAL

CAP-06 contiene 32 Casos de Uso oficiales, CU-001 a CU-032. Esta versión establece una historia por Caso de Uso para evitar duplicidades y mantener trazabilidad directa. El conteo real resultante es **32 Historias de Usuario**, HU-001 a HU-032. No se fuerza el conteo de 40 declarado por el archivo incompleto anterior.

Todas las historias tienen prioridad **MVP — Obligatoria**, porque derivan de Casos de Uso aprobados. La prioridad no establece orden de implementación. ADR-001 y las Decisiones 0010/0014–0016 actualizan el comportamiento sin crear historias adicionales.

## HISTORIAS DE USUARIO — COMPRADOR

### HU-001 — Registro de comprador

- **Actor:** Comprador
- **Historia:** Como comprador, quiero registrarme introduciendo mi fecha de nacimiento, aceptando la declaración de mayoría de edad y las condiciones de compra de alcohol, para crear una cuenta válida y poder comprar en Teralya.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 2 y 3 · CAP-04 FL-COM-001 y FL-SIS-001 · CAP-05 PT-ACC-001, PT-ACC-003 y PT-COM-003 · CAP-06 CU-001.

### HU-002 — Inicio de sesión de comprador

- **Actor:** Comprador
- **Historia:** Como comprador, quiero iniciar sesión con mis credenciales y fusionar el carrito local de visitante cuando exista, para acceder a mi cuenta y continuar sin perder mi selección.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 1 · CAP-04 FL-COM-002 · CAP-05 PT-ACC-003, PT-COM-001 y PT-COM-003 · CAP-06 CU-002.

### HU-003 — Recuperación de contraseña

- **Actor:** Comprador
- **Historia:** Como comprador, quiero recuperar mi contraseña mediante un enlace o token válido, para restablecer el acceso a mi cuenta.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 1 · CAP-04 FL-COM-003 · CAP-05 PT-ACC-004, PT-ACC-005 y PT-ACC-003 · CAP-06 CU-003.

### HU-004 — Consulta del catálogo

- **Actor:** Comprador
- **Historia:** Como comprador, quiero consultar el catálogo público de vinos publicados y disponibles de bodegas validadas, para descubrir productos que puedo comprar.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 4 · CAP-04 FL-COM-004 · CAP-05 PT-PUB-001 y PT-PUB-002 · CAP-06 CU-004.

### HU-005 — Búsqueda y filtros

- **Actor:** Comprador
- **Historia:** Como comprador, quiero buscar y filtrar los vinos publicados, para encontrar productos acordes con los criterios seleccionados.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 5 · CAP-04 FL-COM-005 · CAP-05 PT-PUB-002 y PT-PUB-003 · CAP-06 CU-005.

### HU-006 — Consulta de ficha de vino

- **Actor:** Comprador
- **Historia:** Como comprador, quiero consultar la ficha de un vino publicado con su información comercial, precio, disponibilidad y bodega, para decidir si deseo comprarlo.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 6 y 7 · CAP-04 FL-COM-006 y, para la navegación a la bodega prevista en el caso de uso, FL-COM-007 · CAP-05 PT-PUB-003, PT-PUB-004 y PT-COM-002 · CAP-06 CU-006.

### HU-007 — Añadir vino al carrito

- **Actor:** Visitante / Comprador
- **Historia:** Como visitante o comprador, quiero añadir una cantidad válida de un vino publicado y disponible al carrito local o persistente que corresponda, para incorporarlo a mi futura compra.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-COM-008 · CAP-05 PT-PUB-002, PT-PUB-003, PT-PUB-004 y PT-COM-002 · CAP-06 CU-007.

### HU-008 — Gestión del carrito

- **Actor:** Visitante / Comprador
- **Historia:** Como visitante o comprador, quiero revisar, modificar cantidades o eliminar vinos del carrito local o persistente, para preparar correctamente la compra antes de autenticarme y completar el checkout.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-COM-009 · CAP-05 PT-COM-002 y PT-COM-003 · CAP-06 CU-008.

### HU-009 — Checkout

- **Actor:** Comprador
- **Historia:** Como comprador autenticado, quiero confirmar mis datos, las direcciones obligatorias de envío y facturación y el resumen de compra, para preparar un único Pedido pendiente de pago por Carrito sin duplicarlo ante reintentos.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-COM-010 · CAP-05 PT-COM-003, PT-ACC-003, PT-ACC-001 y PT-COM-004 · CAP-06 CU-009.

### HU-010 — Pago del Pedido

- **Actor:** Comprador
- **Historia:** Como comprador, quiero pagar el Pedido mediante Stripe Checkout reutilizando la sesión activa ante reintentos, para completar la compra y obtener confirmación solo cuando el webhook firmado de Stripe valide el pago.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-COM-011 · CAP-05 PT-COM-004, PT-COM-005 y PT-COM-003 · CAP-06 CU-010.

### HU-011 — Consulta de Pedidos

- **Actor:** Comprador
- **Historia:** Como comprador, quiero consultar el listado y detalle completo de mis Pedidos, para conocer su información y estado global sin gestionar los SubPedidos internos.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-COM-012, FL-COM-013 y FL-COM-014 · CAP-05 PT-COM-001, PT-COM-006, PT-COM-007 y PT-COM-005 · CAP-06 CU-011.

## HISTORIAS DE USUARIO — BODEGA

### HU-012 — Solicitud de registro de bodega

- **Actor:** Bodega
- **Historia:** Como bodega, quiero enviar una solicitud de registro con los datos mínimos y las condiciones aceptadas, para quedar pendiente de validación administrativa.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 8 · CAP-04 FL-BOD-001 · CAP-05 PT-ACC-002 y PT-ACC-003 · CAP-06 CU-012.

### HU-013 — Acceso de bodega validada

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero iniciar sesión y acceder a mi panel, para operar únicamente mis recursos autorizados.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 1 y 8 · CAP-04 FL-BOD-003 · CAP-05 PT-ACC-003, PT-BOD-001 y PT-SIS-003 · CAP-06 CU-013.

### HU-014 — Perfil de bodega

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero completar y editar mi perfil, para publicar la información comercial que genera confianza en los compradores.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 9 · CAP-04 FL-BOD-004 · CAP-05 PT-BOD-001, PT-BOD-002 y PT-PUB-004 · CAP-06 CU-014.

### HU-015 — Creación de vino

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero crear un vino propio con sus datos obligatorios, precio y disponibilidad, para guardarlo como no publicado y prepararlo para revisión.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 9 · CAP-04 FL-BOD-005 · CAP-05 PT-BOD-001, PT-BOD-003, PT-BOD-004 y PT-BOD-006 · CAP-06 CU-015.

### HU-016 — Edición de vino propio

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero editar únicamente un vino propio, para mantener correcta su información antes de solicitar publicación.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 9 · CAP-04 FL-BOD-006 · CAP-05 PT-BOD-003, PT-BOD-005 y PT-BOD-006 · CAP-06 CU-016.

### HU-017 — Solicitud de publicación

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero solicitar la publicación de un vino propio completo, para que el administrador lo revise, quedando el vino en estado `pendiente_revision` sin publicarlo directamente yo misma.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 9 · CAP-04 FL-BOD-007 · CAP-05 PT-BOD-003, PT-BOD-005, PT-BOD-006 y PT-ADM-004 · CAP-06 CU-017.

### HU-018 — Consulta de SubPedidos propios

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero consultar el listado y detalle de los SubPedidos que me corresponden, para preparar su cumplimiento sin acceder al Pedido completo ni a SubPedidos ajenos.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 9 y 11 · CAP-04 FL-BOD-008 y FL-BOD-009 · CAP-05 PT-BOD-001, PT-BOD-007 y PT-BOD-008 · CAP-06 CU-018.

### HU-019 — Cambio de estado de SubPedido

- **Actor:** Bodega
- **Historia:** Como bodega validada, quiero aplicar una transición permitida al estado de un SubPedido propio, para reflejar su avance operativo sin modificar directamente el Pedido global.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-BOD-010 y FL-SIS-005 · CAP-05 PT-BOD-007, PT-BOD-008, PT-COM-007 y PT-ADM-007 · CAP-06 CU-019.

## HISTORIAS DE USUARIO — ADMINISTRADOR

### HU-020 — Acceso administrativo

- **Actor:** Administrador
- **Historia:** Como administrador con permisos activos, quiero iniciar sesión y acceder al dashboard administrativo, para operar las funciones reservadas a mi rol.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 1 · CAP-04 FL-ADM-001 · CAP-05 PT-ACC-003, PT-ADM-001 y PT-SIS-003 · CAP-06 CU-020.

### HU-021 — Validación de bodega

- **Actor:** Administrador
- **Historia:** Como administrador, quiero revisar y validar una solicitud de bodega con datos mínimos suficientes, para habilitar su acceso operativo al marketplace.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 8 y 10 · CAP-04 FL-BOD-002 y FL-ADM-004 · CAP-05 PT-ADM-001, PT-ADM-002 y PT-ADM-003 · CAP-06 CU-021.

### HU-022 — Revisión de vino

- **Actor:** Administrador
- **Historia:** Como administrador, quiero revisar un vino pendiente y comprobar su integridad, precio, disponibilidad y bodega validada, para decidir si puede publicarse.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-005 · CAP-05 PT-ADM-001, PT-ADM-004 y PT-ADM-005 · CAP-06 CU-022.

### HU-023 — Publicación de vino

- **Actor:** Administrador
- **Historia:** Como administrador, quiero publicar un vino completo en estado `pendiente_revision`, con al menos una imagen y perteneciente a una bodega validada, para hacerlo visible y comprable en el catálogo.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-006 · CAP-05 PT-ADM-004, PT-ADM-005, PT-PUB-002 y PT-PUB-003 · CAP-06 CU-023.

### HU-024 — Despublicación de vino

- **Actor:** Administrador
- **Historia:** Como administrador, quiero despublicar un vino, para retirarlo del catálogo y bloquear nuevas compras sin eliminar el histórico de Pedidos.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-007 · CAP-05 PT-ADM-004, PT-ADM-005 y PT-PUB-002 · CAP-06 CU-024.

### HU-025 — Consulta administrativa de Pedidos

- **Actor:** Administrador
- **Historia:** Como administrador, quiero consultar todos los Pedidos y su detalle, incluidos los SubPedidos como información interna, para supervisar la operación del marketplace.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-008 y FL-ADM-009 · CAP-05 PT-ADM-001, PT-ADM-006 y PT-ADM-007 · CAP-06 CU-025.

### HU-026 — Dashboard administrativo

- **Actor:** Administrador
- **Historia:** Como administrador, quiero consultar ventas del día y pedidos pendientes y acceder desde estos últimos al listado correspondiente, para supervisar la actividad mínima del MVP.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-002 y FL-ADM-003 · CAP-05 PT-ADM-001 y PT-ADM-006 · CAP-06 CU-026.

### HU-027 — Gestión de incidencia

- **Actor:** Administrador
- **Historia:** Como administrador, quiero consultar una incidencia y actualizarla mediante una transición permitida, para gestionar el problema asociado a un Pedido, SubPedido, bodega o vino mediante el ciclo `abierta → en_revision → resuelta → cerrada`, sin saltos ni reaperturas.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 10 · CAP-04 FL-ADM-010 · CAP-05 PT-ADM-008, PT-ADM-009 y PT-ADM-007 · CAP-06 CU-027.

## HISTORIAS DE USUARIO — SISTEMA

### HU-028 — Confirmación de Pedido tras el pago

- **Actor:** Sistema
- **Historia:** Como sistema, quiero confirmar un Pedido únicamente tras validar la firma, la unicidad del evento, la aprobación de Stripe y la coincidencia del importe, actualizando `pago.estado` como única fuente económica persistente, para impedir confirmaciones duplicadas o Pedidos confirmados sin pago aprobado.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-SIS-003 y FL-COM-011 · CAP-05 PT-COM-004, PT-COM-005, PT-COM-006 y PT-COM-007 · CAP-06 CU-028.

### HU-029 — Generación de SubPedidos

- **Actor:** Sistema
- **Historia:** Como sistema, quiero agrupar las líneas de un Pedido confirmado por bodega y generar exactamente un SubPedido interno por cada bodega, sin duplicados, para dividir correctamente el cumplimiento multi-bodega.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-SIS-004 · CAP-05 PT-COM-005, PT-BOD-007, PT-BOD-008 y PT-ADM-007 · CAP-06 CU-029.

### HU-030 — Recálculo del estado global

- **Actor:** Sistema
- **Historia:** Como sistema, quiero recalcular cuando corresponda el estado global de un Pedido a partir de `subpedido.estado` tras una actualización válida, para mostrar al comprador y al administrador un estado coherente sin duplicar la fuente logística.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 11 · CAP-04 FL-SIS-005 · CAP-05 PT-BOD-008, PT-COM-007 y PT-ADM-007 · CAP-06 CU-030.

### HU-031 — Control de acceso por rol

- **Actor:** Sistema
- **Historia:** Como sistema, quiero validar autenticación, rol, permisos, asociación obligatoria de usuario de bodega, validación de bodega y propiedad del recurso, para permitir únicamente los accesos autorizados.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulo 1 · CAP-04 FL-SIS-002 · CAP-05 PT-ACC-003, PT-SIS-003, PT-COM-001, PT-BOD-001 y PT-ADM-001 · CAP-06 CU-031.

### HU-032 — Recursos no disponibles o no encontrados

- **Actor:** Sistema
- **Historia:** Como sistema, quiero detectar recursos inexistentes, despublicados, no disponibles o no autorizados y mostrar el estado correspondiente, para proteger la información y evitar acciones inválidas.
- **Prioridad:** MVP — Obligatoria
- **Trazabilidad:** CAP-03 Módulos 1, 4, 6 y 10, según el recurso afectado · CAP-04 FL-SIS-006 y FL-SIS-007 · CAP-05 PT-SIS-001, PT-SIS-002 y PT-SIS-003 · CAP-06 CU-032.

## MATRIZ RESUMIDA DE TRAZABILIDAD

| Historias | Actor | Casos de Uso | Conteo |
|---|---|---|---:|
| HU-001 a HU-011 | Comprador | CU-001 a CU-011 | 11 |
| HU-012 a HU-019 | Bodega | CU-012 a CU-019 | 8 |
| HU-020 a HU-027 | Administrador | CU-020 a CU-027 | 8 |
| HU-028 a HU-032 | Sistema | CU-028 a CU-032 | 5 |
| **Total** |  | **CU-001 a CU-032** | **32** |

## REGLAS TRANSVERSALES

- Conforme a ADR-001 y Decisión 0010, el visitante gestiona un carrito local; al registrarse o iniciar sesión se fusiona con el carrito persistente del Comprador. Checkout siempre exige autenticación.
- `pago.estado` es la única fuente económica persistente y `subpedido.estado` la fuente logística.
- Estas reglas actualizan las historias relacionadas sin crear nuevos CU ni nuevas HU.

## OBSERVACIONES DE REVISIÓN

1. La incidencia sí dispone de trazabilidad suficiente en las fuentes utilizadas: Módulo 10 de CAP-03, FL-ADM-010 de CAP-04, PT-ADM-008 y PT-ADM-009 de CAP-05, y CU-027 de CAP-06.
2. CAP-04 separa algunos recorridos que CAP-06 consolida en un solo Caso de Uso. Por ello una historia puede relacionarse con más de un flujo o pantalla sin crear funcionalidad adicional.
3. CAP-06 no define un Caso de Uso independiente para la ficha pública de bodega. CU-006 incorpora expresamente la navegación a dicha ficha como flujo alternativo; HU-006 conserva esa misma delimitación.
4. Este documento no define criterios de aceptación. Corresponden a CAP-08 y deberán alinearse con estas 32 historias tras la aprobación de CAP-07 v1.2.

## CIERRE

CAP-07 v1.2 queda completo en estado **EN REVISIÓN**, con 32 Historias de Usuario derivadas de los 32 Casos de Uso oficiales y sin ampliar el alcance del MVP.
