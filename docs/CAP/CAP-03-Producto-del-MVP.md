# Teralya CAP-03 - Producto del MVP

## PORTADA

* Teralya * CAP-03 * Producto del MVP * Versión 1.0 * Estado: APROBADO * Fecha: 09/07/2026

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Estado |
| ------- | ---------: | ------------------------------ | -------- |
| 1.0 | 09/07/2026 | Arquitecto de Producto Teralya | APROBADO |

## OBJETIVO DEL DOCUMENTO

Definir el producto funcional del MVP de Teralya, Marketplace Europeo de Bodegas Fundadoras.

Este documento describe la visión general del producto, los objetivos del MVP, los módulos funcionales incluidos, los actores del sistema, los principios funcionales, las funcionalidades excluidas y el glosario operativo.

El documento es autocontenido y debe permitir que cualquier desarrollador, diseñador o Product Manager entienda el funcionamiento completo del producto sin consultar otros capítulos.

Este documento no incluye código, diseño de base de datos, APIs, wireframes, diseño visual ni funcionalidades futuras.

## ÍNDICE

1. Visión general del producto
2. Objetivos del MVP
3. Módulos funcionales
   * Módulo 1 — Acceso, cuentas y recuperación de contraseña
   * Módulo 2 — Registro de comprador y validación de mayoría de edad
   * Módulo 3 — Idioma durante el registro
   * Módulo 4 — Catálogo público de vinos
   * Módulo 5 — Búsqueda y filtros
   * Módulo 6 — Ficha de vino
   * Módulo 7 — Ficha pública de bodega
   * Módulo 8 — Registro y validación de bodegas
   * Módulo 9 — Gestión de perfil y vinos de bodega
   * Módulo 10 — Administración e incidencias
   * Módulo 11 — Pedido
4. Actores del sistema
5. Principios funcionales del MVP
6. Funcionalidades fuera del MVP
7. Glosario
8. Cierre del documento

## VISIÓN GENERAL DEL PRODUCTO

Teralya es un marketplace europeo de bodegas fundadoras orientado a la venta directa de vino.

El MVP permite que compradores descubran vinos publicados por bodegas validadas, consulten información comercial suficiente para confiar en el producto y la bodega, añadan vinos al carrito, completen checkout, paguen mediante Stripe Checkout y consulten sus Pedidos.

El MVP permite que las bodegas soliciten registro, sean validadas por administración, completen su perfil público, creen vinos, soliciten su publicación y gestionen únicamente los SubPedidos que les corresponden.

El MVP permite que el administrador valide bodegas, revise vinos, publique o despublique vinos, consulte Pedidos completos, gestione incidencias y supervise la actividad mínima mediante dos indicadores: ventas del día y pedidos pendientes.

El Pedido es la unidad funcional completa para el comprador y el sistema. Los SubPedidos son una implementación interna generada automáticamente para dividir la operación por bodega. Los SubPedidos no constituyen un módulo funcional independiente para el usuario.

## OBJETIVOS DEL MVP

1. Permitir la venta online de vino de bodegas fundadoras.
2. Permitir que compradores descubran vinos publicados y disponibles.
3. Generar confianza mediante fichas de vino y fichas públicas de bodega.
4. Permitir registro de compradores con validación de mayoría de edad.
5. Permitir compra de vino mediante carrito, checkout y pago con Stripe Checkout.
6. Confirmar Pedidos únicamente cuando el pago haya sido aprobado correctamente.
7. Permitir que bodegas validadas creen y gestionen sus vinos.
8. Mantener control administrativo sobre la publicación de vinos.
9. Permitir que las bodegas gestionen solo los SubPedidos que les corresponden.
10. Recalcular automáticamente el estado global del Pedido cuando corresponda según el conjunto de sus SubPedidos.
11. Permitir supervisión administrativa mínima.
12. Evitar funcionalidades no necesarias para vender en el MVP.

## MÓDULOS FUNCIONALES

### Módulo 1 — Acceso, cuentas y recuperación de contraseña

**Objetivo:** Permitir que compradores, bodegas y administradores accedan al sistema de forma segura según su rol, y puedan recuperar el acceso si olvidan su contraseña.

**Alcance:** Incluye la autenticación de usuarios, control básico de sesión, control de acceso por rol y recuperación de contraseña. Aplica a compradores, bodegas y administradores.

**Funcionalidades incluidas:** Inicio de sesión · Control de credenciales · Acceso a zonas privadas según rol · Bloqueo de acceso a recursos no autorizados · Recuperación de contraseña · Definición de nueva contraseña mediante enlace o token válido · Redirección del usuario a su área correspondiente tras iniciar sesión (Comprador: Mi Cuenta; Bodega: Panel de bodega; Administrador: Dashboard de administrador).

**Funcionalidades excluidas:** Autenticación social · Inicio de sesión con proveedores externos · Autenticación biométrica · Doble factor de autenticación · Gestión avanzada de permisos · Roles personalizados · SSO · App móvil.

**Reglas de negocio:** El email debe ser único · Las credenciales deben ser correctas para iniciar sesión · Un usuario solo puede acceder a zonas permitidas por su rol · Una bodega no validada no puede operar · Un administrador debe tener permisos administrativos activos · Un comprador solo puede acceder a sus propios Pedidos · Una bodega solo puede acceder a sus propios vinos, perfil y SubPedidos · Un usuario no administrador no puede acceder al área administrativa · La recuperación de contraseña requiere un email asociado a una cuenta existente · El enlace o token de recuperación debe ser válido y no estar expirado · La nueva contraseña debe cumplir las reglas mínimas.

**Dependencias:** Cuenta de usuario · Comprador · Bodega · Administrador · Solicitud de recuperación de contraseña · Idioma cuando exista preferencia asociada.

**Observaciones:** Este módulo es transversal. No tiene objetivo comercial directo, pero permite operar el sistema de forma segura.

---

### Módulo 2 — Registro de comprador y validación de mayoría de edad

**Objetivo:** Permitir que un visitante se registre como comprador cumpliendo los requisitos mínimos para comprar alcohol.

**Alcance:** Incluye el registro de comprador, captura de datos obligatorios, fecha de nacimiento, aceptación de mayoría de edad y aceptación de condiciones de compra de alcohol.

**Funcionalidades incluidas:** Registro de comprador · Introducción de datos básicos · Introducción de fecha de nacimiento · Validación de edad mínima configurada · Aceptación de declaración de mayoría de edad · Aceptación de condiciones de compra de alcohol · Creación de cuenta de comprador · Acceso posterior a Mi Cuenta · Continuación de compra si el registro se inicia desde checkout.

**Funcionalidades excluidas:** Registro de menores · Verificación documental de identidad · KYC avanzado · Validación externa de edad · Programa de fidelización · Club de compradores · Preferencias avanzadas de comprador.

**Reglas de negocio:** El comprador debe ser mayor de edad según la edad mínima configurada · El comprador debe introducir su fecha de nacimiento · El comprador debe aceptar la declaración de mayoría de edad · El comprador debe aceptar las condiciones de compra de alcohol · No se permite registrar un comprador que no cumpla la edad mínima · El email debe ser único · Los campos obligatorios deben completarse · La contraseña debe cumplir las reglas mínimas · El comprador debe estar autenticado para completar checkout.

**Dependencias:** Cuenta de usuario · Comprador · Idioma · Checkout cuando el registro se inicia durante una compra.

**Observaciones:** La validación de mayoría de edad es obligatoria porque Teralya comercializa alcohol.

---

### Módulo 3 — Idioma durante el registro

**Objetivo:** Facilitar que el comprador complete el registro en un idioma comprensible dentro del alcance aprobado del MVP.

**Alcance:** Incluye detección del idioma del navegador cuando sea posible y selección manual de otro idioma disponible antes de finalizar el registro.

**Funcionalidades incluidas:** Detección del idioma del navegador cuando sea posible · Presentación del registro en el idioma detectado si está disponible · Selección manual de otro idioma disponible antes de finalizar el registro · Asociación de la preferencia de idioma a la cuenta cuando aplique.

**Funcionalidades excluidas:** Traducción automática · IA aplicada a idioma · Sistema avanzado de internacionalización · Gestión avanzada de contenidos multiidioma · Traducción de documentos legales mediante IA · Preferencias lingüísticas complejas.

**Reglas de negocio:** El sistema detecta el idioma del navegador cuando sea posible · El comprador puede seleccionar otro idioma antes de finalizar el registro · La no detección del idioma no bloquea el registro · La selección de idioma no sustituye ninguna validación obligatoria · La selección de idioma no omite la validación de mayoría de edad · La selección de idioma no omite la aceptación de condiciones de compra de alcohol.

**Dependencias:** Cuenta de usuario · Comprador · Registro de comprador.

**Observaciones:** Este módulo se limita al registro del comprador y no introduce un sistema avanzado de traducción.

---

### Módulo 4 — Catálogo público de vinos

**Objetivo:** Permitir que visitantes y compradores descubran vinos publicados y disponibles.

**Alcance:** Incluye el listado público de vinos, acceso a fichas de vino, acceso a fichas de bodega y navegación comercial básica.

**Funcionalidades incluidas:** Visualización de vinos publicados · Visualización de vinos disponibles · Visualización de vinos de bodegas validadas · Acceso a ficha de vino · Acceso a ficha pública de bodega · Acceso al carrito desde vinos comprables · Estado vacío cuando no existan vinos publicados.

**Funcionalidades excluidas:** Recomendaciones avanzadas · Personalización por comportamiento · IA de recomendación · Rankings avanzados · Comparador de vinos · Wishlist · Favoritos · Club de vinos · Subastas · Venta privada · App móvil.

**Reglas de negocio:** Solo se muestran vinos publicados · Solo se muestran vinos de bodegas validadas · Solo se muestran como comprables los vinos disponibles · Los vinos despublicados no aparecen en catálogo · Los vinos sin disponibilidad no pueden añadirse al carrito · El catálogo debe ayudar a descubrir vinos y avanzar hacia la compra.

**Dependencias:** Vino · Bodega · Administrador para publicación · Carrito · Ficha de vino · Ficha pública de bodega.

**Observaciones:** El catálogo es una pieza central del MVP porque conecta descubrimiento con venta.

---

### Módulo 5 — Búsqueda y filtros

**Objetivo:** Permitir que compradores y visitantes encuentren vinos de forma más rápida dentro del catálogo publicado.

**Alcance:** Incluye búsqueda y filtros básicos aplicados sobre vinos publicados y disponibles dentro del alcance MVP.

**Funcionalidades incluidas:** Búsqueda de vinos · Aplicación de filtros básicos · Limpieza de filtros · Visualización de resultados · Estado sin resultados · Acceso desde resultados a ficha de vino · Acceso desde resultados a ficha de bodega · Posibilidad de añadir al carrito vinos disponibles desde resultados cuando corresponda.

**Funcionalidades excluidas:** Búsqueda semántica avanzada · IA de búsqueda · Autocompletado avanzado · Filtros complejos fuera del MVP · Guardado de búsquedas · Alertas de disponibilidad · Recomendaciones personalizadas.

**Reglas de negocio:** La búsqueda solo aplica sobre vinos publicados · Los filtros solo aplican sobre vinos publicados · No se muestran vinos despublicados · No se muestran vinos de bodegas no validadas · No se permite añadir al carrito vinos no disponibles · El resultado debe ser coherente con los criterios seleccionados.

**Dependencias:** Catálogo público de vinos · Vino · Bodega · Ficha de vino · Carrito.

**Observaciones:** La búsqueda y los filtros deben mantenerse simples para el MVP.

---

### Módulo 6 — Ficha de vino

**Objetivo:** Mostrar la información comercial necesaria para que el comprador decida comprar un vino.

**Alcance:** Incluye la presentación pública de un vino publicado, su precio, disponibilidad, información comercial, bodega propietaria y acción de añadir al carrito.

**Funcionalidades incluidas:** Nombre del vino · Imagen del vino · Descripción comercial · Características principales · Precio · Disponibilidad · Bodega vendedora · Acceso a ficha pública de bodega · Selección de cantidad · Añadir al carrito si el vino está disponible · Estado no disponible cuando aplique · Bloqueo de compra si el vino no cumple condiciones.

**Funcionalidades excluidas:** Reseñas de usuarios · Valoraciones · Preguntas y respuestas · Recomendaciones automáticas · Comparador · Maridajes avanzados · Contenido editorial avanzado · Vídeo · IA generativa · Club · Subastas.

**Reglas de negocio:** La ficha pública solo se muestra para vinos publicados · El vino debe pertenecer a una bodega validada · El vino debe tener precio válido · El vino debe tener disponibilidad válida · Solo se puede añadir al carrito si está disponible · No se puede añadir una cantidad superior a la disponible · Un vino despublicado no puede mostrarse como producto comprable.

**Dependencias:** Vino · Bodega · Catálogo público · Carrito · Administrador para publicación.

**Observaciones:** Cada ficha de vino debe ayudar a vender o generar confianza. No debe incluir elementos fuera del MVP.

---

### Módulo 7 — Ficha pública de bodega

**Objetivo:** Mostrar información pública de una bodega validada para generar confianza y apoyar la venta de sus vinos.

**Alcance:** Incluye la presentación pública de la bodega y sus vinos publicados.

**Funcionalidades incluidas:** Nombre de la bodega · Descripción comercial · Localización general · Información visible para compradores · Listado de vinos publicados de la bodega · Acceso a fichas de vino · Añadir vino al carrito si está disponible.

**Funcionalidades excluidas:** Página editorial avanzada · Blog de bodega · Seguimiento de bodegas · Mensajería con la bodega · CRM · Chat · Reservas de visita · Enoturismo · Club de bodega · Contenido multimedia avanzado.

**Reglas de negocio:** Solo se muestran bodegas validadas · Solo se muestran vinos publicados · Solo se muestran como comprables vinos disponibles · No se muestra información interna de la bodega · La ficha debe generar confianza y facilitar la compra.

**Dependencias:** Bodega · Vino · Catálogo público · Carrito · Validación administrativa.

**Observaciones:** La ficha pública de bodega es importante para confianza, pero debe mantenerse simple en el MVP.

---

### Módulo 8 — Registro y validación de bodegas

**Objetivo:** Permitir que una bodega solicite acceso a Teralya y que el administrador valide su operación.

**Alcance:** Incluye solicitud de registro de bodega, estado pendiente de validación y validación administrativa.

**Funcionalidades incluidas:** Registro de solicitud de bodega · Introducción de datos básicos de la bodega · Introducción de datos de contacto · Aportación de información mínima para validación · Estado pendiente de validación · Validación por administrador · Habilitación de acceso operativo tras validación.

**Funcionalidades excluidas:** Alta automática de bodegas sin revisión · Verificación documental avanzada · KYC avanzado · Contratos digitales avanzados · Gestión de planes comerciales · Suscripciones de bodegas · Onboarding guiado avanzado · CRM comercial.

**Reglas de negocio:** El email debe ser único · La bodega debe aportar datos mínimos · La bodega queda pendiente de validación tras solicitar registro · Solo el administrador puede validar bodegas · Una bodega no validada no puede operar · Solo bodegas validadas pueden crear operación efectiva en el marketplace · Solo bodegas validadas pueden tener vinos publicados.

**Dependencias:** Cuenta de usuario · Bodega · Administrador · Panel de bodega · Gestión de vinos.

**Observaciones:** La validación de bodega es una barrera funcional necesaria para proteger la confianza del marketplace.

---

### Módulo 9 — Gestión de perfil y vinos de bodega

**Objetivo:** Permitir que una bodega validada complete su perfil, cree vinos, edite vinos propios y solicite publicación.

**Alcance:** Incluye el panel básico de bodega, perfil de bodega, creación y edición de vinos, consulta de estado de revisión y solicitud de publicación.

**Funcionalidades incluidas:** Acceso al panel de bodega · Consulta del estado básico de la bodega · Completar perfil público de bodega · Editar perfil de bodega · Crear vino · Editar vino propio · Consultar vinos propios · Consultar estado de publicación y revisión · Solicitar publicación de vino · Consultar SubPedidos propios desde el panel de bodega.

**Funcionalidades excluidas:** Publicación directa por parte de la bodega · Gestión de vinos de otras bodegas · Gestión del Pedido completo · Analítica avanzada de ventas · CRM · Gestión avanzada de inventario · Importación masiva de productos · Sincronización externa con ERP · Gestión de promociones · Cupones · Subastas.

**Reglas de negocio:** La bodega debe estar autenticada · La bodega debe estar validada · La bodega solo puede gestionar su propio perfil · La bodega solo puede crear y editar vinos propios · El vino no queda publicado automáticamente al crearse · La bodega debe solicitar publicación · La publicación requiere revisión administrativa · No se puede solicitar publicación si faltan datos obligatorios · Precio y disponibilidad deben ser válidos · La bodega solo puede consultar y gestionar sus propios SubPedidos · La bodega no gestiona el Pedido completo.

**Dependencias:** Cuenta de usuario · Bodega · Vino · Administrador · SubPedido · Pedido como origen del SubPedido.

**Observaciones:** La gestión de bodega debe centrarse en permitir que la bodega venda lo antes posible sin añadir herramientas avanzadas.

---

### Módulo 10 — Administración e incidencias

**Objetivo:** Permitir que el administrador opere y supervise el MVP de Teralya.

**Alcance:** Incluye dashboard administrativo mínimo, validación de bodegas, revisión de vinos, publicación y despublicación de vinos, consulta de Pedidos e incidencias.

**Funcionalidades incluidas:** Acceso al dashboard administrativo · Indicador de ventas del día · Indicador de pedidos pendientes · Acceso directo desde pedidos pendientes al listado correspondiente · Validación de bodegas · Revisión de vinos · Publicación de vinos · Despublicación de vinos · Consulta de Pedidos completos · Consulta de SubPedidos como información operativa interna dentro del Pedido · Consulta de incidencias · Actualización de estado de incidencias.

**Funcionalidades excluidas:** Métricas adicionales en dashboard · Analítica avanzada · Business intelligence · CRM · Gestión avanzada de soporte · Gestión avanzada de usuarios · Roles administrativos personalizados · Automatizaciones complejas · Herramientas financieras avanzadas · Backoffice avanzado.

**Reglas de negocio:** Solo el administrador puede acceder al área administrativa · El dashboard del MVP solo muestra ventas del día y pedidos pendientes · El indicador de pedidos pendientes debe permitir acceso directo a los pedidos pendientes · Solo el administrador puede validar bodegas · Solo el administrador puede publicar o despublicar vinos · No se puede publicar un vino incompleto · No se puede publicar un vino de bodega no validada · La despublicación retira el vino del catálogo público · La despublicación no elimina el histórico de Pedidos · Solo el administrador puede consultar todos los Pedidos · Los SubPedidos se muestran al administrador como información operativa interna · Solo el administrador puede gestionar incidencias · Una incidencia requiere información mínima para cerrarse.

**Dependencias:** Cuenta de usuario · Administrador · Bodega · Vino · Pedido · SubPedido · Incidencia · Pago para ventas del día · Estado de Pedido para pedidos pendientes.

**Observaciones:** El administrador debe tener control suficiente para operar el MVP sin convertir el producto en un backoffice complejo.

---

### Módulo 11 — Pedido

**Objetivo:** Permitir que el comprador complete una compra y que el sistema gestione internamente la operación derivada.

**Alcance:** Incluye carrito, checkout, pago mediante Stripe Connect y Stripe Checkout, Pedido confirmado y gestión automática de SubPedidos.

**Funcionalidades incluidas:** Carrito · Checkout · Pago mediante Stripe Connect · Pago mediante Stripe Checkout con redirección · Confirmación del resultado del pago · Pedido · Confirmación de pedido · Consulta de pedidos por comprador · Consulta de pedido completo por administrador · Gestión automática de SubPedidos · Consulta y gestión de SubPedidos por bodega · Recalculo automático del estado global del Pedido cuando corresponda según el conjunto de sus SubPedidos.

**Funcionalidades excluidas:** SubPedidos como módulo funcional independiente · Gestión del Pedido completo por parte de la bodega · Pago fuera de Stripe · Pago contra reembolso · Transferencia bancaria · Wallet interna · Financiación · Suscripciones · Recompra automática · Cupones · Promociones · Facturación avanzada · Logística avanzada · Devoluciones avanzadas · Seguimiento avanzado de envío · Marketplace multi-operador avanzado fuera del alcance MVP.

**Reglas de negocio:** El carrito debe contener al menos un vino válido para iniciar checkout · No se puede añadir al carrito un vino despublicado · No se puede añadir al carrito un vino no disponible · No se puede añadir una cantidad superior a la disponibilidad · El comprador debe estar autenticado para completar checkout · El checkout requiere datos obligatorios y dirección de envío válida · El Pedido debe estar preparado correctamente antes de iniciar pago · El pago se realiza mediante Stripe Checkout con redirección · El Pedido solo se confirma si Stripe confirma correctamente el pago · No existe Pedido confirmado sin pago aprobado · Tras confirmar el Pedido, el sistema genera internamente los SubPedidos necesarios por bodega · Los SubPedidos son una implementación interna del sistema · Los SubPedidos no constituyen un módulo funcional independiente para comprador, bodega ni administrador · La bodega solo gestiona los SubPedidos que le corresponden · La bodega no gestiona el Pedido completo · El comprador consulta el Pedido completo · El administrador consulta el Pedido completo · El sistema actualiza el estado del SubPedido y, cuando corresponda, recalcula automáticamente el estado global del Pedido según el conjunto de sus SubPedidos · La despublicación posterior de un vino no elimina el histórico de Pedidos.

**Dependencias:** Comprador · Vino · Bodega · Carrito · Checkout · Dirección de envío · Pago · Stripe Connect · Stripe Checkout · Pedido · SubPedido · Administrador para consulta operativa · Incidencia cuando aplique.

**Observaciones:** El Módulo Pedido es el núcleo transaccional del MVP. Incluye: Carrito, Checkout, Pago mediante Stripe Connect, Pedido, Gestión automática de SubPedidos. Los SubPedidos son una implementación interna del sistema. No constituyen un módulo funcional independiente para comprador, bodega ni administrador.

## ACTORES DEL SISTEMA

### Comprador
Usuario que descubre vinos, consulta fichas, añade vinos al carrito, completa checkout, paga y consulta sus Pedidos.

**Responsabilidades principales:** Registrarse cumpliendo mayoría de edad · Aceptar condiciones de compra de alcohol · Iniciar sesión · Consultar catálogo · Buscar y filtrar vinos · Consultar fichas de vino y bodega · Añadir vinos al carrito · Completar checkout · Pagar mediante Stripe Checkout · Consultar sus Pedidos.

**Restricciones principales:** No puede comprar si no cumple la edad mínima · No puede completar checkout sin autenticación · No puede consultar Pedidos de otros compradores · No gestiona SubPedidos.

### Bodega
Proveedor que solicita registro, es validado por administración y opera sus vinos y SubPedidos.

**Responsabilidades principales:** Solicitar registro · Acceder cuando esté validada · Completar perfil · Crear vinos · Editar vinos propios · Solicitar publicación · Consultar SubPedidos propios · Cambiar estado de SubPedidos propios.

**Restricciones principales:** No puede operar sin validación · No puede publicar directamente vinos · No puede editar vinos de otra bodega · No puede gestionar SubPedidos de otra bodega · No puede gestionar el Pedido completo.

### Administrador
Usuario interno responsable de operar el MVP.

**Responsabilidades principales:** Acceder al dashboard administrativo · Consultar ventas del día · Consultar pedidos pendientes · Acceder directamente a pedidos pendientes desde el dashboard · Validar bodegas · Revisar vinos · Publicar vinos · Despublicar vinos · Consultar Pedidos · Consultar SubPedidos como información interna · Gestionar incidencias.

**Restricciones principales:** No debe disponer de métricas adicionales en dashboard dentro del MVP · No sustituye la gestión operativa de la bodega · No opera un CRM dentro del MVP.

### Sistema
Conjunto de reglas y automatismos internos necesarios para que el producto funcione.

**Responsabilidades principales:** Validar acceso por rol · Validar edad mínima del comprador · Detectar idioma del navegador cuando sea posible · Preparar Pedido antes del pago · Crear sesión de Stripe Checkout · Confirmar resultado de pago · Confirmar Pedido tras pago correcto · Generar SubPedidos internos · Recalcular el estado global del Pedido cuando corresponda · Proteger recursos no autorizados · Mostrar estados de error, vacío, carga o correcto según corresponda.

## PRINCIPIOS FUNCIONALES DEL MVP

1. **Primero ventas, luego perfección.** Cada módulo debe contribuir a vender vino, generar confianza o permitir la operación mínima necesaria.
2. **Simplicidad como ventaja.** El MVP debe evitar estructuras complejas que no sean necesarias para vender.
3. **No añadir funciones fuera del MVP.** Cualquier función no esencial se considera V2 y queda excluida.
4. **Cada pantalla debe ayudar a vender vino o generar confianza.** El producto debe evitar pantallas decorativas o informativas sin impacto funcional en venta, confianza u operación.
5. **No diseñar app móvil.** El MVP no incluye aplicación móvil.
6. **No diseñar IA.** El MVP no incluye IA, recomendaciones inteligentes, generación automática de contenido ni traducción automática.
7. **No diseñar club.** El MVP no incluye club de vinos, membresías, fidelización ni beneficios recurrentes.
8. **No diseñar subastas.** El MVP no incluye subastas ni pujas.
9. **No diseñar CRM.** El MVP no incluye CRM comercial ni sistema avanzado de soporte.
10. **Decisiones claras para Lovable.** La documentación debe ser suficientemente clara para permitir desarrollo posterior sin interpretación funcional ambigua.
11. **Pedido completo para comprador y sistema.** El Pedido es la unidad funcional de compra visible para el comprador y consultable por administración.
12. **SubPedidos internos.** Los SubPedidos existen solo para dividir la operación por bodega. No son un módulo independiente.
13. **Control administrativo del catálogo.** La publicación de vinos depende del administrador. La bodega no publica directamente.
14. **Pago confirmado antes de Pedido confirmado.** El Pedido solo se confirma cuando Stripe confirma correctamente el pago.
15. **Cumplimiento de mayoría de edad.** El comprador debe cumplir la edad mínima configurada y aceptar la declaración de mayoría de edad y condiciones de compra de alcohol.

## FUNCIONALIDADES FUERA DEL MVP

App móvil · IA · Recomendaciones inteligentes · Traducción automática · Club de vinos · Fidelización · Puntos o recompensas · Suscripciones · Subastas · CRM · Chat entre comprador y bodega · Mensajería interna · Blog · Contenido editorial avanzado · Valoraciones y reseñas · Comparador de vinos · Wishlist · Favoritos · Guardado de búsquedas · Alertas de disponibilidad · Cupones · Promociones · Descuentos avanzados · Pago contra reembolso · Transferencia bancaria · Wallet interna · Financiación · Facturación avanzada · Gestión avanzada de inventario · Importación masiva de vinos · Integraciones con ERP · Logística avanzada · Seguimiento avanzado de envío · Devoluciones avanzadas · KYC avanzado · Verificación documental de edad · Analítica avanzada · Business intelligence · Métricas administrativas adicionales · Gestión avanzada de permisos · Roles personalizados · SSO · Autenticación social · Doble factor de autenticación · Reservas de visitas a bodegas · Enoturismo · Marketplace avanzado fuera del alcance aprobado.

## GLOSARIO

**Administrador** — Usuario interno con permisos para validar bodegas, revisar vinos, publicar o despublicar vinos, consultar Pedidos y gestionar incidencias.

**Bodega** — Proveedor del marketplace que puede crear vinos, solicitar publicación y gestionar SubPedidos propios tras validación administrativa.

**Carrito** — Selección temporal de vinos antes del checkout.

**Checkout** — Proceso de confirmación de datos, dirección de envío y total antes del pago.

**Comprador** — Usuario que compra vino en Teralya. Debe cumplir la edad mínima configurada y aceptar condiciones de compra de alcohol.

**Dashboard administrativo** — Pantalla de supervisión mínima del administrador. En MVP solo muestra ventas del día y pedidos pendientes.

**Ficha de bodega** — Vista pública de una bodega validada, orientada a generar confianza y mostrar sus vinos publicados.

**Ficha de vino** — Vista pública de un vino publicado con información comercial, precio, disponibilidad y acción de compra.

**Incidencia** — Problema operativo básico relacionado con Pedido, bodega o vino, gestionado por administración.

**MVP** — Producto mínimo viable aprobado para Teralya. Prioriza venta, simplicidad y operación básica.

**Pago** — Proceso económico mediante Stripe Connect y Stripe Checkout.

**Pedido** — Compra completa realizada por un comprador tras pago correcto.

**Stripe Checkout** — Flujo de pago con redirección a Stripe y retorno a Teralya tras el resultado.

**Stripe Connect** — Sistema de pago aprobado para el MVP.

**SubPedido** — División interna del Pedido por bodega. La bodega solo gestiona sus propios SubPedidos. No es un módulo funcional independiente.

**Vino** — Producto vendible del marketplace, creado por una bodega y publicado por administración.

## CIERRE DEL DOCUMENTO

CAP-03 define el producto funcional oficial del MVP de Teralya.

El MVP queda estructurado en 11 módulos funcionales: 1. Acceso, cuentas y recuperación de contraseña. 2. Registro de comprador y validación de mayoría de edad. 3. Idioma durante el registro. 4. Catálogo público de vinos. 5. Búsqueda y filtros. 6. Ficha de vino. 7. Ficha pública de bodega. 8. Registro y validación de bodegas. 9. Gestión de perfil y vinos de bodega. 10. Administración e incidencias. 11. Pedido.

El Módulo 11 — Pedido incluye: Carrito, Checkout, Pago mediante Stripe Connect, Pedido, Gestión automática de SubPedidos. Los SubPedidos son una implementación interna del sistema. No constituyen un módulo funcional independiente para comprador, bodega ni administrador.

Quedan excluidos de CAP-03: Código · Diseño de base de datos · APIs · Wireframes · Diseño visual · App móvil · IA · Club · Subastas · CRM · Funcionalidades V2.

**CAP-03 queda cerrado como documento oficial definitivo del Producto del MVP de Teralya.**
