# Teralya CAP-04 - Flujos Funcionales

## PORTADA

* Teralya * CAP-04 * Flujos Funcionales * Versión 1.0 * Estado: APROBADO * Fecha: 09/07/2026

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado |
| ------- | ---------: | ------------------------------ | -------- |
| 1.0 | 09/07/2026 | Arquitecto de Producto Teralya | APROBADO |

## OBJETIVO DEL DOCUMENTO

Definir los flujos funcionales oficiales del MVP de Teralya, Marketplace Europeo de Bodegas Fundadoras. Este documento describe las secuencias funcionales que deben cumplir comprador, bodega, administrador y sistema para operar el producto aprobado. El documento es autocontenido y debe permitir que cualquier desarrollador comprenda todos los flujos funcionales del MVP sin consultar otros capítulos. Este documento no incluye código, APIs, diseño de base de datos, wireframes, diseño visual ni funcionalidades futuras.

## ÍNDICE

**1. Comprador:** FL-COM-001 Registro de comprador · FL-COM-002 Inicio de sesión de comprador · FL-COM-003 Recuperación de contraseña · FL-COM-004 Descubrir vinos · FL-COM-005 Buscar y filtrar vinos · FL-COM-006 Ver ficha de vino · FL-COM-007 Ver ficha de bodega · FL-COM-008 Añadir vino al carrito · FL-COM-009 Gestionar carrito · FL-COM-010 Checkout · FL-COM-011 Pago mediante Stripe Checkout · FL-COM-012 Confirmación de pedido · FL-COM-013 Consulta de pedidos · FL-COM-014 Consulta de detalle de pedido

**2. Bodega:** FL-BOD-001 Registro de bodega · FL-BOD-002 Validación de bodega · FL-BOD-003 Primer acceso de bodega · FL-BOD-004 Completar perfil de bodega · FL-BOD-005 Crear vino · FL-BOD-006 Editar vino · FL-BOD-007 Solicitar publicación de vino · FL-BOD-008 Consultar SubPedidos · FL-BOD-009 Consultar detalle de SubPedido · FL-BOD-010 Cambiar estado de SubPedido

**3. Administrador:** FL-ADM-001 Inicio de sesión de administrador · FL-ADM-002 Consultar dashboard administrativo · FL-ADM-003 Acceder a pedidos pendientes desde dashboard · FL-ADM-004 Validar bodega · FL-ADM-005 Revisar vino · FL-ADM-006 Publicar vino · FL-ADM-007 Despublicar vino · FL-ADM-008 Consultar pedidos · FL-ADM-009 Consultar detalle de pedido · FL-ADM-010 Gestionar incidencias

**4. Sistema:** FL-SIS-001 Detectar y aplicar idioma en registro · FL-SIS-002 Controlar acceso por rol · FL-SIS-003 Confirmar pago y Pedido · FL-SIS-004 Generar SubPedidos internos · FL-SIS-005 Recalcular estado global del Pedido · FL-SIS-006 Gestionar recursos no encontrados o no autorizados · FL-SIS-007 Gestionar errores generales

5. Matriz de flujos · 6. Glosario · 7. Cierre del documento

## COMPRADOR

### FL-COM-001 — Registro de comprador
**Objetivo:** Permitir que un visitante cree una cuenta de comprador en Teralya cumpliendo los requisitos de mayoría de edad y aceptación de condiciones de compra de alcohol.
**Actor principal:** Comprador.
**Punto de inicio:** El visitante decide registrarse como comprador desde el acceso público, desde inicio de sesión o desde checkout.
**Secuencia:** 1. El comprador inicia el registro. 2. El sistema muestra el formulario de registro. 3. El sistema detecta el idioma del navegador cuando sea posible. 4. El comprador puede mantener el idioma detectado o seleccionar otro idioma disponible antes de finalizar el registro. 5. El comprador introduce sus datos obligatorios. 6. El comprador introduce su fecha de nacimiento. 7. El comprador acepta la declaración de mayoría de edad. 8. El comprador acepta las condiciones de compra de alcohol. 9. El comprador introduce una contraseña válida. 10. El comprador confirma el registro. 11. El sistema valida que el email no esté registrado previamente. 12. El sistema valida que la fecha de nacimiento cumple la edad mínima configurada. 13. El sistema valida que las condiciones obligatorias han sido aceptadas. 14. El sistema crea la cuenta de comprador. 15. El sistema deja al comprador preparado para iniciar sesión o continuar el proceso de compra si venía desde checkout.
**Punto final:** La cuenta de comprador queda creada.
**Reglas de negocio:** El email debe ser único · El comprador debe introducir fecha de nacimiento · debe cumplir la edad mínima configurada · debe aceptar la declaración de mayoría de edad · debe aceptar las condiciones de compra de alcohol · La contraseña debe cumplir las reglas mínimas · El idioma detectado o seleccionado no sustituye ninguna validación obligatoria · El comprador debe estar autenticado para completar checkout.
**Excepciones:** Email ya registrado · Datos obligatorios incompletos · Contraseña no válida · Edad insuficiente · Declaración de mayoría de edad no aceptada · Condiciones de compra de alcohol no aceptadas · Error al crear la cuenta.

### FL-COM-002 — Inicio de sesión de comprador
**Objetivo:** Permitir que el comprador acceda a su cuenta.
**Secuencia:** 1. El comprador accede al inicio de sesión. 2-3. Introduce email y contraseña. 4. Confirma el acceso. 5. El sistema valida las credenciales. 6. Valida que la cuenta corresponde a un comprador activo. 7. Inicia la sesión. 8. Dirige a Mi Cuenta o al proceso iniciado previamente.
**Reglas de negocio:** Credenciales correctas · cuenta activa · rol comprador · el comprador solo accede a sus propios recursos · puede ser devuelto a checkout si inició sesión durante una compra.
**Excepciones:** Credenciales incorrectas · cuenta no activa · usuario sin rol comprador · error de autenticación · sesión no creada correctamente.

### FL-COM-003 — Recuperación de contraseña
**Actor principal:** Comprador, bodega o administrador.
**Secuencia:** 1. Inicia recuperación. 2. Introduce email. 3-4. El sistema valida formato y existencia de cuenta. 5. Genera solicitud. 6. Envía instrucciones. 7. El usuario accede al enlace. 8. Sistema valida token. 9-10. Introduce y confirma nueva contraseña. 11. Sistema valida. 12. Actualiza contraseña. 13. Usuario inicia sesión con la nueva.
**Reglas de negocio:** Email asociado a cuenta existente · token válido y no expirado · contraseña cumple reglas mínimas · confirmación coincide · solicitud no se reutiliza.
**Excepciones:** Email inválido/no asociado · token inválido/expirado · contraseña no válida · confirmación no coincidente · error al actualizar.

### FL-COM-004 — Descubrir vinos
**Secuencia:** 1. Accede a zona pública. 2-4. Sistema carga vinos publicados, de bodegas validadas, disponibles. 5-6. Comprador revisa y selecciona.
**Reglas de negocio:** Solo vinos publicados de bodegas validadas; solo disponibles son comprables; catálogo facilita descubrimiento.
**Excepciones:** Sin vinos publicados/disponibles · error de carga.

### FL-COM-005 — Buscar y filtrar vinos
**Secuencia:** 1. Introduce búsqueda/filtros. 2-5. Sistema aplica criterios sobre publicados, excluye despublicados y de bodegas no validadas. 6-8. Muestra resultados; comprador revisa/ajusta.
**Reglas de negocio:** Búsqueda y filtros solo sobre publicados; sin búsqueda semántica ni IA.
**Excepciones:** Sin resultados · filtros inválidos · error de proceso/carga.

### FL-COM-006 — Ver ficha de vino
**Secuencia:** 1. Solicita ficha. 2-4. Sistema valida existencia, publicación, bodega validada. 5-6. Carga y muestra info. 7-8. Comprador decide añadir al carrito, ver bodega o volver.
**Reglas de negocio:** Ficha solo para publicados de bodega validada; precio y disponibilidad válidos para añadir al carrito.
**Excepciones:** No encontrado · despublicado · bodega no validada · sin disponibilidad · error de carga.

### FL-COM-007 — Ver ficha de bodega
**Secuencia:** 1. Solicita ficha de bodega. 2-3. Valida existencia y validación. 4-6. Carga info pública y vinos publicados. 7-8. Comprador revisa y continúa.
**Reglas de negocio:** Solo bodegas validadas; solo vinos publicados; sin info interna.
**Excepciones:** No encontrada · no validada · sin vinos publicados · error de carga.

### FL-COM-008 — Añadir vino al carrito
**Secuencia:** 1-2. Selecciona vino y cantidad. 3-7. Sistema valida existencia, publicación, bodega validada, disponibilidad, cantidad. 8-9. Añade y recalcula. 10. Continúa.
**Reglas de negocio:** No añadir despublicado, de bodega no validada, sin disponibilidad, ni cantidad superior a la disponible; recálculo tras cada cambio.
**Excepciones:** No encontrado · despublicado · bodega no validada · sin disponibilidad · cantidad inválida/excesiva · error al actualizar.

### FL-COM-009 — Gestionar carrito
**Secuencia:** 1-4. Abre carrito, sistema carga líneas, valida publicación/disponibilidad. 5. Muestra detalle. 6-8. Comprador modifica/elimina; sistema recalcula. 9. Decide continuar o checkout.
**Reglas de negocio:** Carrito con al menos un vino válido para checkout; cantidades válidas; no superar disponibilidad; no checkout con carrito vacío.
**Excepciones:** Carrito vacío · vino despublicado/no disponible · cantidad inválida · error de recálculo/actualización.

### FL-COM-010 — Checkout
**Secuencia:** 1-5. Inicia checkout; sistema valida carrito no vacío, autenticación, carga resumen, valida disponibilidad. 6-9. Comprador confirma datos y dirección; sistema valida dirección y calcula total. 10-12. Comprador revisa y confirma; sistema prepara Pedido para pago.
**Reglas de negocio:** Autenticación requerida; carrito válido; vinos publicados y disponibles; dirección completa y válida; total correcto; no se inicia pago si checkout inválido.
**Excepciones:** No autenticado · carrito vacío · datos incompletos · dirección inválida · vino no disponible · cambio de disponibilidad antes del pago · error al preparar Pedido.

### FL-COM-011 — Pago mediante Stripe Checkout
**Objetivo:** Permitir que el comprador pague un Pedido mediante Stripe Checkout y que Teralya confirme el Pedido solo tras confirmación correcta de Stripe.
**Secuencia:** 1-3. Comprador confirma pago; sistema valida Pedido preparado e importe. 4. Sistema crea sesión de Stripe Checkout. 5-6. Comprador es redirigido y paga en Stripe. 7-8. Stripe procesa y redirige de vuelta. 9-10. Sistema confirma resultado y confirma el Pedido únicamente si Stripe confirma correctamente. 11-12. Pedido disponible para consulta; se inicia gestión de SubPedidos.
**Reglas de negocio:** Stripe Connect es el sistema de pago del MVP; flujo con redirección; Pedido solo se confirma con pago aprobado; no existe Pedido confirmado sin pago aprobado; tras pago correcto se generan SubPedidos.
**Excepciones:** Pago rechazado/cancelado/interrumpido · error de conexión con Stripe · sesión no creada · confirmación no recibida · error al confirmar Pedido.

### FL-COM-012 — Confirmación de pedido
**Secuencia:** 1. Comprador vuelve tras pago correcto. 2-4. Sistema valida pertenencia y muestra identificador. 5-7. Muestra resumen, total y estado inicial. 8. Comprador navega a detalle, Mis pedidos o catálogo.
**Reglas de negocio:** Solo se muestra si el pago está confirmado; Pedido debe pertenecer al comprador; Pedido completo es unidad visible; SubPedidos gestionados internamente.
**Excepciones:** No encontrado · no pertenece al comprador · pago no confirmado · error de carga.

### FL-COM-013 — Consulta de pedidos
**Secuencia:** 1-4. Accede a Mis pedidos; sistema valida autenticación y busca Pedidos. 5-6. Muestra listado con id, fecha, importe y estado global.
**Reglas de negocio:** Solo Pedidos propios; estado mostrado es el global; comprador no gestiona SubPedidos.
**Excepciones:** No autenticado · sin Pedidos · error de carga · acceso no autorizado.

### FL-COM-014 — Consulta de detalle de pedido
**Secuencia:** 1-5. Solicita detalle; sistema valida autenticación, existencia y pertenencia; carga detalle. 6-8. Muestra id, fecha, estado global, vinos, bodegas, total y dirección; comprador revisa y vuelve.
**Reglas de negocio:** Solo Pedidos propios; Pedido completo es la unidad visible; SubPedidos no gestionados por el comprador.
**Excepciones:** No encontrado · no pertenece · no autenticado · error de carga · acceso no autorizado.

## BODEGA

### FL-BOD-001 — Registro de bodega
**Secuencia:** 1-4. Accede al registro; introduce datos básicos, contacto e información mínima. 5-6. Acepta condiciones y envía. 7-10. Sistema valida campos y email único; registra solicitud como pendiente de validación.
**Reglas de negocio:** Email único; datos mínimos; aceptación de condiciones obligatorias; no puede operar hasta validación; solo el administrador valida.
**Excepciones:** Email ya registrado · datos incompletos · condiciones no aceptadas · error al registrar.

### FL-BOD-002 — Validación de bodega
**Secuencia:** 1-2. Envía solicitud; queda pendiente. 3-4. Administrador revisa y valida si cumple requisitos. 5-7. Sistema cambia estado a validada y habilita acceso operativo.
**Reglas de negocio:** No puede operar sin validación; solo el administrador valida; requiere datos mínimos; solo bodegas validadas publican vinos.
**Excepciones:** Datos insuficientes · no encontrada · ya validada · error al validar · administrador sin permisos.

### FL-BOD-003 — Primer acceso de bodega
**Secuencia:** 1-6. Accede con credenciales; sistema valida credenciales, rol bodega y validación; inicia sesión. 7-8. Muestra panel y orienta hacia completar perfil y gestionar vinos.
**Reglas de negocio:** Debe estar validada para operar; solo accede a su propia información; no accede a funciones administrativas ni al Pedido completo.
**Excepciones:** Credenciales incorrectas · no validada · cuenta no activa · usuario sin rol bodega · error de autenticación.

### FL-BOD-004 — Completar perfil de bodega
**Secuencia:** 1-3. Accede a perfil; sistema valida autenticación/validación y carga info existente. 4-6. Introduce/edita datos y guarda. 7-9. Sistema valida formatos y actualiza; info pública queda disponible.
**Reglas de negocio:** Debe estar autenticada y validada; solo edita su propio perfil; campos obligatorios completos.
**Excepciones:** No autenticada/validada · campos incompletos · formato inválido · error al guardar.

### FL-BOD-005 — Crear vino
**Secuencia:** 1-2. Inicia creación; sistema valida autenticación/validación. 3-7. Introduce nombre, descripción, precio, disponibilidad e info mínima. 8-11. Guarda; sistema valida y crea el vino como no publicado.
**Reglas de negocio:** Bodega validada; solo crea vinos propios; precio y disponibilidad válidos; no se publica automáticamente; publicación requiere revisión administrativa.
**Excepciones:** No validada · campos incompletos · precio/disponibilidad inválidos · error al crear.

### FL-BOD-006 — Editar vino
**Secuencia:** 1-5. Accede a sus vinos, selecciona uno; sistema valida existencia y pertenencia; carga info. 6-10. Modifica y guarda; sistema valida y actualiza.
**Reglas de negocio:** Solo edita vinos propios; debe estar validada; no se guarda info inválida; no se solicita publicación con datos faltantes.
**Excepciones:** No encontrado · no pertenece · no validada · datos inválidos · error al guardar.

### FL-BOD-007 — Solicitar publicación de vino
**Objetivo:** Permitir que una bodega envíe un vino propio a revisión administrativa para su posible publicación.
**Secuencia:** 1-3. Accede al vino; sistema valida pertenencia; solicita publicación. 4-6. Sistema valida validación de bodega, info mínima completa, precio y disponibilidad. 7-8. Marca como pendiente de revisión; el administrador podrá revisar y decidir publicación.
**Reglas de negocio:** La bodega NO publica directamente vinos; la publicación requiere aprobación administrativa; bodega validada; vino con info mínima completa; precio y disponibilidad válidos.
**Excepciones:** Vino incompleto · precio/disponibilidad inválidos · no pertenece a la bodega · bodega no validada · error al solicitar revisión.

### FL-BOD-008 — Consultar SubPedidos
**Secuencia:** 1-4. Accede a SubPedidos; sistema valida autenticación/validación y busca SubPedidos asociados. 5-7. Muestra listado; bodega revisa y selecciona.
**Reglas de negocio:** Solo gestiona SubPedidos propios; no gestiona el Pedido completo; SubPedidos son implementación interna, no módulo independiente.
**Excepciones:** No autenticada/validada · sin SubPedidos asignados · error de carga · acceso no autorizado.

### FL-BOD-009 — Consultar detalle de SubPedido
**Secuencia:** 1-5. Solicita detalle; sistema valida autenticación, validación, existencia y pertenencia. 6-8. Muestra info operativa; bodega revisa y puede cambiar estado.
**Reglas de negocio:** Solo SubPedidos propios; no modifica info global del Pedido; info de envío limitada a lo necesario.
**Excepciones:** No encontrado · no pertenece · no validada · error de carga · acceso no autorizado.

### FL-BOD-010 — Cambiar estado de SubPedido
**Secuencia:** 1-2. Revisa estado actual; selecciona nuevo estado. 3-5. Sistema valida autenticación/validación, pertenencia y transición permitida. 6-9. Confirma; sistema actualiza estado y, cuando corresponda, recalcula automáticamente el estado global del Pedido; guarda.
**Reglas de negocio:** Solo cambia estados de SubPedidos propios; no modifica directamente el Pedido completo; solo transiciones aprobadas; recálculo automático del estado global cuando corresponda.
**Excepciones:** No encontrado · no pertenece · transición no permitida · error al actualizar/recalcular.

## ADMINISTRADOR

### FL-ADM-001 — Inicio de sesión de administrador
**Secuencia:** 1-5. Introduce credenciales; sistema valida credenciales, rol administrador y permisos activos; inicia sesión. 6. Dirige al dashboard.
**Reglas de negocio:** Solo rol administrador accede al área administrativa; permisos activos requeridos; compradores/bodegas no acceden a rutas administrativas.
**Excepciones:** Credenciales incorrectas · sin rol administrador · permisos no activos · cuenta no activa · error de autenticación.

### FL-ADM-002 — Consultar dashboard administrativo
**Secuencia:** 1-2. Accede; sistema valida permisos. 3-5. Carga y muestra ventas del día y pedidos pendientes. 6-7. Muestra accesos a gestión operativa; administrador navega.
**Reglas de negocio:** Dashboard del MVP solo muestra ventas del día y pedidos pendientes; no se muestran métricas adicionales; indicador de pendientes permite acceso directo.
**Excepciones:** Sin permisos · error al cargar indicadores · sesión expirada.

### FL-ADM-003 — Acceder a pedidos pendientes desde dashboard
**Secuencia:** 1-3. Consulta dashboard, ve indicador, lo selecciona. 4-6. Sistema valida permisos y dirige al listado; administrador revisa.
**Reglas de negocio:** El indicador debe permitir acceso directo al listado; solo el administrador consulta todos los pedidos.
**Excepciones:** Sin pedidos pendientes · sin permisos · error de carga · sesión expirada.

### FL-ADM-004 — Validar bodega
**Secuencia:** 1-4. Accede a pendientes; sistema valida permisos y muestra solicitudes; selecciona una. 5-9. Revisa datos y valida; sistema cambia estado a validada; bodega queda habilitada.
**Reglas de negocio:** Solo el administrador valida; datos mínimos suficientes; bodega no validada no opera; solo validadas publican vinos.
**Excepciones:** No encontrada · datos insuficientes · ya validada · sin permisos · error al validar.

### FL-ADM-005 — Revisar vino
**Secuencia:** 1-4. Accede a revisión; sistema valida permisos y muestra pendientes; selecciona uno. 5-7. Muestra info completa; administrador revisa y decide si puede publicarse.
**Reglas de negocio:** Solo el administrador revisa para publicación; bodega propietaria validada; vino con info mínima completa; precio/disponibilidad válidos.
**Excepciones:** No encontrado · info incompleta · bodega no validada · sin permisos · error de carga.

### FL-ADM-006 — Publicar vino
**Objetivo:** Permitir que el administrador haga visible un vino en el marketplace.
**Secuencia:** 1-6. Accede al detalle; sistema valida permisos, existencia, bodega validada, info mínima, precio y disponibilidad. 7-9. Administrador confirma; sistema cambia estado a publicado; vino visible en catálogo, búsqueda y ficha pública.
**Reglas de negocio:** Solo el administrador publica; solo vinos de bodegas validadas; no se publica vino incompleto; precio y disponibilidad válidos.
**Excepciones:** No encontrado · bodega no validada · info incompleta · precio/disponibilidad inválidos · error al publicar.

### FL-ADM-007 — Despublicar vino
**Secuencia:** 1-3. Accede al detalle; sistema valida permisos y existencia. 4-7. Confirma despublicación; sistema cambia estado; vino deja de aparecer; histórico de Pedidos se conserva.
**Reglas de negocio:** Solo el administrador despublica; no aparece como comprable; no puede añadirse al carrito; no elimina histórico de Pedidos.
**Excepciones:** No encontrado · ya despublicado · sin permisos · error al despublicar.

### FL-ADM-008 — Consultar pedidos
**Secuencia:** 1-4. Accede a Pedidos; sistema valida permisos y carga listado. 5-6. Muestra info; administrador revisa y selecciona.
**Reglas de negocio:** Solo el administrador consulta todos los Pedidos; listado muestra Pedidos completos; SubPedidos no se tratan como módulo independiente.
**Excepciones:** Sin Pedidos · sin permisos · error de carga.

### FL-ADM-009 — Consultar detalle de pedido
**Secuencia:** 1-4. Solicita detalle; sistema valida permisos, existencia y carga info completa. 5-6. Muestra datos del Pedido y SubPedidos como info operativa interna. 7-8. Administrador revisa y navega.
**Reglas de negocio:** Solo el administrador consulta todos los Pedidos; SubPedidos como info operativa interna, no módulo independiente; Pedido completo pertenece al comprador y al sistema.
**Excepciones:** No encontrado · sin permisos · error de carga · incidencia relacionada no encontrada.

### FL-ADM-010 — Gestionar incidencias
**Secuencia:** 1-4. Accede a incidencias; sistema valida permisos y muestra listado; selecciona una. 5-9. Revisa info; selecciona nuevo estado; sistema valida información mínima y guarda. 10. Vuelve al listado o recurso relacionado.
**Reglas de negocio:** Solo el administrador gestiona incidencias; puede asociarse a Pedido, bodega o vino; requiere info mínima para cerrarse; sin CRM ni soporte avanzado.
**Excepciones:** No encontrada · transición no permitida · info insuficiente · sin permisos · error al actualizar.

## SISTEMA

### FL-SIS-001 — Detectar y aplicar idioma en registro
**Secuencia:** 1-3. Recibe solicitud de registro; intenta detectar idioma; comprueba disponibilidad. 4-5. Presenta en idioma detectado o por defecto. 6-8. Permite selección manual; aplica idioma; continúa sin alterar validaciones obligatorias.
**Reglas de negocio:** Detección no bloquea el registro; selección de idioma disponible; idioma no sustituye validación de edad ni aceptación de condiciones de alcohol; sin traducción automática ni IA.
**Excepciones:** Idioma no detectado/disponible · error al aplicar · selección no válida.

### FL-SIS-002 — Controlar acceso por rol
**Secuencia:** 1-5. Recibe solicitud; comprueba autenticación, rol, permisos y propiedad del recurso. 6-8. Permite o bloquea; muestra resultado.
**Reglas de negocio:** Comprador solo sus Pedidos; bodega solo su perfil/vinos/SubPedidos propios; solo administrador accede al área administrativa; bodega no validada no opera.
**Excepciones:** No autenticado · sesión expirada · rol no autorizado · recurso no pertenece al usuario · error al validar.

### FL-SIS-003 — Confirmar pago y Pedido
**Objetivo:** Confirmar un Pedido únicamente cuando Stripe confirme correctamente el pago.
**Secuencia:** 1-5. Recibe resultado; identifica Pedido preparado; valida procedencia Stripe, aprobación e importe. 6-9. Actualiza estado de pago; confirma Pedido; deja disponible confirmación; activa generación de SubPedidos.
**Reglas de negocio:** No existe Pedido confirmado sin pago aprobado; solo con confirmación válida de Stripe; pago rechazado/cancelado/interrumpido no confirma Pedido; confirmación habilita SubPedidos.
**Excepciones:** Confirmación no recibida/inválida · pago rechazado/cancelado · importe no coincidente · Pedido preparado no encontrado · error al confirmar.

### FL-SIS-004 — Generar SubPedidos internos
**Secuencia:** 1-4. Identifica líneas y bodega propietaria de cada vino; agrupa por bodega; genera un SubPedido por bodega. 5-9. Añade líneas correspondientes; asocia a Pedido y bodega; deja disponibles para la bodega; conserva el Pedido completo como unidad del comprador y del sistema.
**Reglas de negocio:** Generación automática; implementación interna, no módulo independiente; bodega solo gestiona sus propios SubPedidos; comprador consulta el Pedido completo; administrador puede consultar SubPedidos como info operativa.
**Excepciones:** Pedido no confirmado · línea sin vino válido · vino sin bodega asociada · bodega no validada · error al generar/asignar.

### FL-SIS-005 — Recalcular estado global del Pedido
**Secuencia:** 1-4. Recibe actualización de SubPedido; valida existencia y transición; guarda nuevo estado. 5-9. Identifica Pedido asociado; obtiene conjunto de SubPedidos; evalúa si corresponde recalcular; recalcula y guarda estado global. 10. Estado disponible para comprador y administrador.
**Reglas de negocio:** El sistema actualiza el estado del SubPedido y, cuando corresponda, recalcula automáticamente el estado global del Pedido según el conjunto de sus SubPedidos; bodega no modifica directamente el Pedido completo.
**Excepciones:** SubPedido no encontrado · estado no permitido · Pedido asociado no encontrado · inconsistencia Pedido/SubPedidos · error al recalcular/guardar.

### FL-SIS-006 — Gestionar recursos no encontrados o no autorizados
**Secuencia:** 1-4. Recibe solicitud; comprueba existencia, disponibilidad y permisos. 5-8. Muestra recurso, no encontrado, no autorizado, o evita mostrar recurso despublicado como comprable.
**Reglas de negocio:** No se muestran vinos despublicados como comprables; no se muestran bodegas no validadas públicamente; no se muestran Pedidos/SubPedidos ajenos; sin acceso administrativo sin rol.
**Excepciones:** Recurso inexistente/despublicado/no autorizado · usuario no autenticado · error al validar.

### FL-SIS-007 — Gestionar errores generales
**Secuencia:** 1-3. Detecta que la acción/carga no puede completarse; detiene operación; muestra mensaje comprensible. 4-7. Ofrece volver a zona segura y reintentar cuando corresponda, respetando el rol del usuario.
**Reglas de negocio:** Errores comprensibles; navegación de salida respeta el rol; no expone info no autorizada; un error de pago no confirma un Pedido.
**Excepciones:** Error no recuperable · de conexión · de carga · de validación · de pago · de permisos.

## MATRIZ DE FLUJOS (resumen)

Los 14 flujos de Comprador, 10 de Bodega, 10 de Administrador y 7 de Sistema (total 41 flujos) están listados en el índice anterior con su código, actor y resultado funcional. Ver detalle completo en cada sección.

## GLOSARIO

Coincide con el glosario de CAP-03 (Administrador, Bodega, Carrito, Checkout, Comprador, Dashboard administrativo, Ficha de bodega, Ficha de vino, Flujo funcional, Incidencia, Mi Cuenta, Pedido, Pedido preparado para pago, Stripe Checkout, Stripe Connect, SubPedido, Vino).

## CIERRE DEL DOCUMENTO

CAP-04 define los flujos funcionales oficiales del MVP de Teralya para Comprador, Bodega, Administrador y Sistema.

Confirma, entre otras, estas decisiones funcionales aprobadas: el comprador debe cumplir mayoría de edad y aceptar condiciones de compra de alcohol; el sistema detecta idioma del navegador y permite selección durante el registro; el catálogo muestra únicamente vinos publicados de bodegas validadas; el pago se realiza mediante Stripe Checkout con redirección; el Pedido solo se confirma tras confirmación correcta de Stripe; los SubPedidos se generan automáticamente como implementación interna; la bodega solo gestiona sus SubPedidos; el Pedido completo pertenece al comprador y al sistema; el sistema recalcula automáticamente el estado global del Pedido cuando corresponda; el dashboard administrativo del MVP solo muestra ventas del día y pedidos pendientes.

Quedan excluidos de CAP-04: código, APIs, diseño de base de datos, wireframes, diseño visual, app móvil, IA, club, subastas, CRM, funcionalidades V2.

**CAP-04 queda cerrado como documento oficial definitivo de Flujos Funcionales de Teralya.**
