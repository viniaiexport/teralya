# INF-09 – Arquitectura Frontend

**Teralya · Versión 1.0 · Julio 2026 · Preparado por Claude**
Documento de arquitectura del Frontend del MVP. No incluye código, React, TypeScript ni CSS. Se basa exclusivamente en la documentación oficial del repositorio: CAP-01 a CAP-08 e INF-05 a INF-08. No añade funcionalidad ni amplía el alcance del MVP.

---

## ⚠️ Contradicción detectada — requiere decisión del CTO antes de implementar

**Carrito de un visitante no autenticado.** CAP-05 (pantalla PT-COM-002, Carrito) lista como usuarios autorizados "Visitante, Comprador" — un visitante sin cuenta debería poder tener carrito. Sin embargo, INF-05 define `carrito.comprador_id` como `NOT NULL` con FK obligatoria a `comprador.usuario_id`: el esquema aprobado no permite que exista un carrito sin un comprador autenticado. Esta contradicción afecta directamente a los apartados 10 y 11 de este documento. No se resuelve aquí — se deja marcada en ambos apartados y como ADR propuesto (ver final del documento), a la espera de que el CTO decida entre: (a) permitir carrito de visitante en cliente sin persistir en `carrito` hasta el registro/login, o (b) revisar INF-05 para permitir `comprador_id` nulo.

---

## 1. Objetivo

Definir la arquitectura técnica del Frontend del MVP de Teralya de forma que sea una consecuencia directa de CAP-05 (Pantallas del MVP), CAP-06 (Casos de Uso), INF-07 (stack aprobado: React + TypeScript) e INF-08 (API disponible). El documento debe permitir a cualquier desarrollador construir el Frontend sin tomar decisiones funcionales por su cuenta.

## 2. Principios de arquitectura

- **Una pantalla del Frontend = una pantalla de CAP-05.** Ninguna vista se crea sin un código PT-XXX correspondiente.
- **Cada pantalla debe ayudar a vender vino o generar confianza** (principio 4 de CAP-03) o a operar el MVP; se excluyen pantallas decorativas.
- **El Frontend no contiene lógica de negocio.** Toda regla de negocio (validación de edad, disponibilidad, transición de estado, cálculo de importes) vive en el backend (INF-08) y en el esquema (INF-05/06); el Frontend solo la refleja.
- **Simplicidad como ventaja** (CAP-03 principio 2): sin gestión de estado compleja, sin capas de abstracción innecesarias para un equipo reducido.
- **Separación clara por rol**: Comprador, Bodega y Administrador son áreas de navegación independientes, reflejando los tres actores de CAP-03/CAP-06.
- **Diseño antes que desarrollo** (INF-07 §1): este documento se aprueba antes de escribir código de Frontend.

## 3. Estructura del proyecto Next.js

El Frontend se construye como una única aplicación Next.js (App Router), no como tres aplicaciones separadas, para compartir componentes, cliente de API, autenticación e internacionalización entre las áreas de Comprador, Bodega y Administrador. Esto es coherente con INF-07 §1 ("un único despliegue... preparado para extraerse si el volumen lo justifica").

La aplicación se organiza en grupos de rutas por rol, no en aplicaciones independientes:
- Grupo público (sin autenticación).
- Grupo de acceso (registro, login, recuperación).
- Grupo de comprador (autenticado, rol comprador).
- Grupo de bodega (autenticado, rol bodega).
- Grupo de administrador (autenticado, rol administrador).
- Rutas de sistema (errores).

## 4. Organización de carpetas

Descripción conceptual, sin nombres de archivo de código:

- **Rutas públicas**: Inicio, Catálogo, Ficha de vino, Ficha de bodega (PT-PUB-001 a 004).
- **Rutas de acceso**: Registro comprador, Registro bodega, Login, Recuperación, Nueva contraseña (PT-ACC-001 a 005).
- **Rutas de comprador**: Mi Cuenta, Carrito, Checkout, Pago, Confirmación, Mis pedidos, Detalle de pedido (PT-COM-001 a 007).
- **Rutas de bodega**: Panel, Perfil, Vinos, Crear vino, Editar vino, Detalle de vino, SubPedidos, Detalle de SubPedido (PT-BOD-001 a 008).
- **Rutas de administrador**: Dashboard, Validación de bodegas, Detalle de bodega, Revisión de vinos, Detalle de vino, Pedidos, Detalle de pedido, Incidencias, Detalle de incidencia (PT-ADM-001 a 009).
- **Rutas de sistema**: Error general, No encontrado, Acceso no autorizado (PT-SIS-001 a 003).
- **Componentes compartidos**: elementos reutilizables entre áreas (ver §17).
- **Servicios de integración**: cliente de la API de INF-08, cliente de Supabase (sesión/autenticación), cliente de redirección a Stripe Checkout.
- **Internacionalización**: recursos de idioma (ES/EN/FR/DE/IT).

## 5. Sistema de rutas

Cada pantalla de CAP-05 corresponde a una única ruta. La agrupación de rutas por rol determina qué capa de autorización aplica (ver §9). Las rutas de comprador, bodega y administrador son mutuamente excluyentes: un usuario autenticado solo ve las rutas correspondientes a su rol (`usuario.rol`, INF-05), conforme a FL-SIS-002 (Controlar acceso por rol).

Las rutas con parámetro (ficha de vino, ficha de bodega, detalle de pedido, detalle de SubPedido, detalle de incidencia) usan el identificador del recurso correspondiente, consistente con las rutas de INF-08 (p. ej. `/vinos/{id}` → API-010).

## 6. Layouts

Se definen cinco layouts, uno por grupo de rutas:
1. **Layout público**: navegación a catálogo, registro, login, carrito.
2. **Layout de acceso**: formulario centrado, sin navegación completa.
3. **Layout de comprador**: navegación a Mi Cuenta, Mis pedidos, catálogo, carrito.
4. **Layout de bodega**: navegación al panel, vinos, SubPedidos.
5. **Layout de administrador**: navegación al dashboard, bodegas, vinos, pedidos, incidencias.

Las rutas de sistema (PT-SIS-001 a 003) no llevan navegación de rol; ofrecen únicamente volver a una zona segura, conforme a FL-SIS-007.

## 7. Navegación

La navegación entre pantallas sigue exactamente las relaciones "Navegación" descritas en cada pantalla de CAP-05 (a qué pantallas se puede ir y desde cuáles se puede llegar). No se añaden accesos de navegación no descritos en CAP-05. La navegación tras iniciar sesión redirige según el rol (Comprador → Mi Cuenta; Bodega → Panel de bodega; Administrador → Dashboard), conforme a CAP-03 Módulo 1 y FL-COM-002/FL-BOD-003/FL-ADM-001.

## 8. Autenticación

La autenticación se apoya en Supabase Auth (ver §20) como proveedor subyacente de sesión, sirviendo los casos de uso CU-001 (registro comprador), CU-002 (login), CU-003 (recuperación de contraseña) y CU-012 (registro de bodega). El Frontend gestiona:
- Formularios de registro, login y recuperación (pantallas PT-ACC-001 a 005).
- Persistencia de sesión entre navegaciones.
- Redirección tras login según el flujo interrumpido (p. ej. continuar checkout tras iniciar sesión, FL-COM-002).

El Frontend no implementa lógica de verificación de credenciales ni de hashing: esto es responsabilidad del backend/Supabase Auth.

## 9. Autorización por roles

Cada grupo de rutas (comprador, bodega, administrador) valida en el Frontend que el usuario autenticado tiene el rol correspondiente (`usuario.rol`), y redirige a login o a una pantalla de acceso no autorizado (PT-SIS-003) en caso contrario. Esta validación en el Frontend es una capa de experiencia de usuario; la autorización real y obligatoria ocurre en el backend (INF-08, cada endpoint valida "Actor autorizado"), conforme a FL-SIS-002. El Frontend nunca debe ser la única barrera de seguridad.

Adicionalmente: una bodega no validada no debe poder operar en su panel (CAP-03 Módulo 8), y esto se refleja mostrando el estado de validación en el Frontend, no ocultando la restricción real que impone el backend.

## 10. Gestión de estado

Dado el principio de simplicidad (CAP-03), el MVP no requiere una librería de gestión de estado global compleja. Se distinguen dos tipos de estado:
- **Estado de sesión** (usuario autenticado, rol): gestionado por la integración con Supabase Auth, disponible globalmente en la aplicación.
- **Estado de servidor** (catálogo, pedidos, vinos, SubPedidos): se obtiene bajo demanda desde la API de INF-08 en cada pantalla; no se duplica en un almacén global.

**Carrito — pendiente de decisión del CTO (ver contradicción al inicio del documento).** Para un comprador autenticado, el carrito puede tratarse como estado de servidor (tabla `carrito`, INF-05, vía API-011 a API-015). Para un visitante sin cuenta, CAP-05 exige que la pantalla de Carrito sea utilizable, pero INF-05 no permite persistir un carrito sin `comprador_id`. Este documento no asume una solución técnica para el carrito de visitante hasta que el CTO resuelva la contradicción.

No se diseña aquí una solución técnica específica de gestión de estado (fuera de alcance: "no escribas código").

## 11. Formularios

Los formularios del MVP corresponden exactamente a los flujos aprobados:
- Registro de comprador (fecha de nacimiento, declaración de mayoría de edad, condiciones de compra de alcohol — CU-001, FL-COM-001).
- Registro de bodega (CU-012, FL-BOD-001).
- Login y recuperación de contraseña (CU-002/003).
- Completar perfil de bodega (CU-014, FL-BOD-004).
- Crear y editar vino (CU-015/016, FL-BOD-005/006).
- Checkout (dirección de envío, CU-009, FL-COM-010).

Los formularios validan en el cliente los mismos requisitos obligatorios que exige el backend (campos obligatorios, formato, edad mínima) **como ayuda a la experiencia de usuario**, pero la validación autoritativa siempre ocurre en el backend (INF-08/INF-06); el Frontend nunca asume que su propia validación es suficiente.

## 12. Gestión de errores

Se reutilizan directamente las pantallas de sistema de CAP-05:
- **PT-SIS-001 (Error general)** para errores no recuperables, de conexión o de carga (FL-SIS-007).
- **PT-SIS-002 (No encontrado)** para recursos inexistentes o despublicados (FL-SIS-006).
- **PT-SIS-003 (Acceso no autorizado)** para accesos bloqueados por rol o propiedad del recurso (FL-SIS-002/006).

La navegación de salida desde cualquier error respeta el rol del usuario (vuelve a Mi Cuenta, al panel de bodega, al dashboard o al inicio, según corresponda), conforme a FL-SIS-007. Un error de pago nunca debe mostrarse como confirmación de Pedido (FL-SIS-003).

## 13. Estados de carga

CAP-05 define cuatro estados posibles por pantalla: **Vacío, Cargando, Correcto, Error**. El Frontend debe implementar estos cuatro estados de forma consistente en cada pantalla, tal como se describen individualmente en cada ficha de CAP-05 (p. ej. catálogo vacío cuando no hay vinos publicados, carrito vacío, sin resultados de búsqueda, sin Pedidos, sin incidencias). No se diseñan estados adicionales no contemplados en CAP-05.

## 14. Internacionalización (i18n)

Conforme a la Decisión CTO del 09/07/2026 (Decision Log 0007; INF-07 §2.1) y a CAP-03 Módulo 3 / CAP-04 FL-SIS-001:
- El Frontend detecta el idioma del navegador cuando sea posible.
- Si el idioma detectado no está disponible, se usa un idioma por defecto.
- El comprador puede seleccionar manualmente otro idioma disponible **antes de finalizar el registro** (alcance explícito de CAP-03 Módulo 3).
- Idiomas soportados en el MVP: español, inglés, francés, alemán, italiano.
- La preferencia de idioma se asocia a la cuenta cuando aplica (`usuario.idioma`, INF-05).

**Explícitamente fuera de alcance** (igual que en INF-07 §2.1 y CAP-03 Módulo 3): traducción automática, IA aplicada a idioma, traducción de contenido de vinos o bodegas, sistema avanzado de internacionalización. La selección de idioma no sustituye ninguna validación obligatoria (edad, condiciones de compra de alcohol).

## 15. Responsive

CAP-03 excluye explícitamente la aplicación móvil nativa, pero no excluye que la aplicación web se use desde dispositivos móviles. El Frontend debe ser utilizable en anchos de pantalla habituales de escritorio y móvil, sin que esto constituya una funcionalidad nueva: es una condición base de cualquier aplicación web pública (PT-PUB-001 a 004 son de acceso público general). No se diseña aquí ningún comportamiento específico adicional por dispositivo.

## 16. Accesibilidad

Se aplican prácticas básicas ya implícitas en la documentación aprobada, no un programa de accesibilidad avanzado fuera del MVP:
- Texto alternativo en imágenes, ya obligatorio a nivel de datos (`imagen.alt_text`, regla de negocio de INF-05/06).
- Estructura de contenido navegable acorde a los estados definidos en CAP-05 (vacío, cargando, correcto, error) para que cualquier estado sea comprensible.
- Mensajes de error comprensibles, conforme a FL-SIS-007.

## 17. Componentes reutilizables

Componentes que se repiten entre varias pantallas de CAP-05 y deben diseñarse una sola vez:
- Tarjeta de vino (usada en Catálogo, Búsqueda, Ficha de bodega — PT-PUB-002/003/004).
- Tarjeta/resumen de bodega (Ficha de bodega, Inicio).
- Línea de carrito (Carrito, Checkout — PT-COM-002/003).
- Indicador de estado de Pedido/SubPedido (Mis pedidos, Detalle de pedido, Panel de bodega, Pedidos de administrador).
- Selector de idioma (pantallas de acceso, conforme a §14).
- Formulario de dirección de envío (Checkout).
- Listado con estados vacío/cargando/error reutilizable en catálogo, SubPedidos, Pedidos, incidencias, bodegas pendientes.

## 18. Convenciones de nombres

Para mantener coherencia con la documentación aprobada (CAP-01 a CAP-08, INF-05/06/08), las convenciones de nombres del Frontend deben usar el mismo vocabulario de dominio ya establecido, en español, tal como aparece en el esquema y en las entidades: `Pedido`, `SubPedido`, `Bodega`, `Vino`, `Carrito`, `Checkout`, `Comprador`. No se traducen ni se renombran estos conceptos de dominio en la interfaz ni en la documentación técnica del Frontend, para evitar la deriva terminológica que ya se corrigió en el Decision Log (fusión Usuario Base/Usuario, Contradicción 1).

## 19. Integración con INF-08

Cada pantalla consume exclusivamente los endpoints de INF-08 v2.0 que le corresponden por su código de Pantalla/Caso de Uso, sin llamar a ningún endpoint no documentado. Ejemplos de correspondencia directa:
- PT-PUB-002 (Catálogo) → API-009.
- PT-PUB-003 (Ficha de vino) → API-010.
- PT-COM-002 (Carrito) → API-011 a API-015.
- PT-COM-003/004/005 (Checkout, Pago, Confirmación) → API-016, API-017, API-018.
- PT-COM-006/007 (Mis pedidos, Detalle) → API-019, API-020.
- PT-BOD-004/005 (Crear/Editar vino) → API-007, API-008.
- PT-BOD-007/008 (SubPedidos) → API-021, API-022, API-023.
- PT-ADM-001 (Dashboard) → API-028.
- PT-ADM-002 (Validación de bodegas) → API-024.
- PT-ADM-004/005 (Revisión/Publicación de vinos) → API-025, API-026.

El Frontend no reimplementa reglas de negocio ya resueltas por estos endpoints (cálculo de totales, reparto de pago, transición de estados).

## 20. Integración con Supabase

Supabase actúa como proveedor de la base de datos PostgreSQL (INF-05). Para autenticación, existe una tensión no resuelta entre dos documentos: INF-05/INF-07 §5 asumen contraseñas gestionadas por la propia aplicación (`usuario.password_hash`, hashing bcrypt/argon2), mientras que delegar la autenticación en Supabase Auth implicaría que Supabase gestione las credenciales en su propio esquema, no en `usuario.password_hash`. **Esto no se resuelve en este documento** — ver ADR propuesto al final. Hasta que se decida, el Frontend debe limitarse a:
- Gestionar la sesión del usuario autenticado (token de sesión), sea cual sea el mecanismo final.
- Disparar los flujos de registro, login y recuperación de contraseña que respaldan CU-001, CU-002, CU-003, CU-012, sin asumir de qué tabla exacta procede la validación de credenciales.

El Frontend **no consulta directamente las tablas de INF-05 vía Supabase** para datos de negocio: el acceso a vinos, pedidos, SubPedidos y bodegas se realiza siempre a través de la API de INF-08, para mantener la validación de reglas de negocio centralizada en el backend y no duplicarla en el cliente.

## 21. Integración con Stripe Checkout

Conforme a CU-010, FL-COM-011 e INF-08 (API-017/API-018/API-029):
1. El Frontend llama a API-017 ("Pagar Pedido") tras un checkout válido.
2. El Frontend redirige al comprador a la URL de sesión de Stripe Checkout devuelta por API-017.
3. Stripe procesa el pago y redirige de vuelta a Teralya.
4. El Frontend consulta API-018 ("Consultar confirmación de Pedido") para mostrar la pantalla de Confirmación (PT-COM-005) únicamente si el pago fue aprobado.

El Frontend nunca confirma un Pedido por sí mismo: la confirmación autoritativa llega al backend mediante el webhook de Stripe (API-029), no mediante ninguna acción del Frontend.

## 22. Reglas obligatorias de desarrollo Frontend

1. Ninguna pantalla se construye sin un código PT-XXX en CAP-05.
2. Ninguna llamada a la API se hace a un endpoint fuera de INF-08 v2.0.
3. Ninguna validación de negocio se implementa solo en el Frontend sin respaldo del backend.
4. No se construyen funcionalidades listadas como excluidas en CAP-03 (favoritos, wishlist, reseñas, chat, CRM, club, subastas, app móvil, IA, traducción automática, etc.).
5. La bodega nunca publica ni despublica vinos desde su panel: esas acciones no existen en su interfaz (CU-023/024 son exclusivas de Administrador).
6. El comprador nunca ve ni gestiona SubPedidos como unidad propia; solo el Pedido completo (CAP-03 Módulo 11).
7. El dashboard de administrador nunca muestra más de los dos indicadores aprobados (CU-026).

## 23. Dependencias

- **INF-08 v2.0** — contrato de API que el Frontend consume.
- **INF-05 / INF-06** — modelo de datos que determina la forma de los datos mostrados y los campos de los formularios.
- **CAP-05** — inventario completo de pantallas, único origen de qué construir.
- **CAP-06** — Casos de Uso que determinan el comportamiento esperado de cada acción de usuario.
- **Supabase** — autenticación y base de datos subyacente.
- **Stripe Checkout** — procesamiento de pago.

## 24. Riesgos técnicos

- **Desincronización Pedido/SubPedido**: si el Frontend no consulta bien qué endpoint es autoritativo (API-020 para el Pedido completo del comprador, API-022/023 para el SubPedido de la bodega), puede mostrar estados inconsistentes. Mitigación: seguir estrictamente la correspondencia de §19.
- **Confirmación de pago prematura**: si el Frontend interpretara el retorno de Stripe como confirmación sin consultar API-018/webhook, podría mostrar una confirmación falsa. Mitigación: nunca confirmar sin respuesta positiva de API-018.
- **Scope creep en i18n**: el alcance aprobado limita la internacionalización al registro y a la interfaz; extenderlo a traducción de contenido de vinos/bodegas sin decisión del CTO ampliaría el MVP. Mitigación: aplicar estrictamente el límite de §14.
- **Autorización solo en el cliente**: confiar en la ocultación de rutas en el Frontend como única barrera de seguridad sería un riesgo grave. Mitigación: §9 exige que la autorización real viva siempre en el backend.

## 25. Recomendaciones para implementación

1. Construir primero el esqueleto de rutas y layouts (§3-§7) antes que ningún formulario o llamada a API.
2. Implementar primero el grupo público y de acceso (CU-001/002/003/004/005/006), por ser la puerta de entrada de todo el producto.
3. Implementar el flujo completo de Comprador (catálogo → carrito → checkout → pago → confirmación → pedidos) de principio a fin antes de empezar Bodega o Administrador, por ser el núcleo transaccional del MVP (CAP-03 Módulo 11).
4. Implementar después el panel de Bodega y, en último lugar, el área de Administrador.
5. Validar cada pantalla terminada contra su ficha exacta en CAP-05 (componentes visibles, acciones disponibles, estados, navegación) antes de darla por cerrada.

---

## ADRs propuestos

Decisiones de arquitectura que deberían fijarse formalmente (no se crean aquí, solo se proponen):

1. **Carrito de visitante no autenticado.** Resolver la contradicción CAP-05 (PT-COM-002 admite "Visitante") vs. INF-05 (`carrito.comprador_id NOT NULL`). Opciones a decidir: (a) carrito solo en cliente para visitantes, sincronizado a la tabla `carrito` al registrarse/iniciar sesión; (b) modificar INF-05 para permitir carrito sin comprador. Afecta a las secciones 3, 10 y 11 de este documento.

2. **Autenticación: Supabase Auth vs. `usuario.password_hash` propio.** Resolver si Supabase Auth gestiona las credenciales (y qué ocurre con `usuario.password_hash` en INF-05, que quedaría sin uso) o si Supabase se usa solo como base de datos y la autenticación se construye a medida sobre la tabla `usuario` ya aprobada. Afecta a las secciones 8, 9 y 20.

3. **Next.js: App Router vs. Pages Router.** Este documento asume App Router (§3) por ser el estándar actual, pero no existe una decisión previa del CTO al respecto en INF-07. Se recomienda fijarlo formalmente antes de iniciar la implementación, ya que determina la estructura completa de carpetas (§3-4).

---

*INF-09 – Arquitectura Frontend. Documento de arquitectura, sin código. Basado en CAP-01 a CAP-08 e INF-05 a INF-08 (repositorio oficial `viniaiexport/teralya`). Contiene una contradicción detectada (ver inicio del documento) y tres ADRs propuestos. Pendiente de revisión y aprobación del CTO.*
