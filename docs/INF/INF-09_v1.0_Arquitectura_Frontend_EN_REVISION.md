# INF-09 – Arquitectura Frontend

**Teralya · Versión 1.0 · Julio 2026 · Estado: EN REVISIÓN · Preparado por Claude**
Documento de arquitectura del Frontend del MVP. No incluye código, React, TypeScript ni CSS. Basado en la línea base documental cerrada tras la auditoría de coherencia conjunta: CAP-01, CAP-03, CAP-04, CAP-05, CAP-06 (v1.0 aprobadas), CAP-02 v1.1, CAP-07 v1.1, CAP-08 v1.1, INF-05 v1.2, INF-06 v1.1, INF-07 v1.2, INF-08 v2.1, Decision Log (incluye Decisiones 0010/0011), ADR-001 y ADR-002. Conserva exactamente los 25 apartados originalmente autorizados. No añade funcionalidad ni amplía el alcance del MVP.

---

## 1. Objetivo

Definir la arquitectura técnica del Frontend del MVP de Teralya como consecuencia directa de CAP-05 (Pantallas), CAP-06 (Casos de Uso), INF-07 v1.2 (stack aprobado) e INF-08 v2.1 (API disponible, con protección de idempotencia). Permitir que cualquier desarrollador construya el Frontend sin tomar decisiones funcionales por su cuenta.

## 2. Principios de arquitectura

- **Una pantalla del Frontend = una pantalla de CAP-05.** Ninguna vista se crea sin un código PT-XXX correspondiente.
- **Cada pantalla debe ayudar a vender vino o generar confianza** (CAP-03, principio 4) o a operar el MVP.
- **El Frontend no contiene lógica de negocio.** Toda regla (edad mínima, disponibilidad, transición de estado, reparto de pago, idempotencia de checkout/pago) vive en el backend (INF-08) y en el esquema (INF-05/06 v1.2/v1.1); el Frontend solo la refleja.
- **Simplicidad como ventaja** (CAP-03, principio 2): sin gestión de estado compleja ni capas de abstracción innecesarias.
- **Separación clara por rol**: Comprador, Bodega y Administrador son áreas de navegación independientes (CAP-03/CAP-06).
- **Modelo de marketplace respetado**: Teralya no compra ni almacena stock; la bodega gestiona su propio catálogo, stock y envío (CAP-02 v1.1). El Frontend nunca muestra ni implica que Teralya sea vendedor o transportista.

## 3. Estructura completa del proyecto Next.js

Aplicación Next.js única (App Router — ver ADR-003 propuesto, §"ADRs propuestos"), no tres aplicaciones separadas, para compartir componentes, cliente de API, autenticación e internacionalización entre Comprador, Bodega y Administrador, conforme a INF-07 §1 y §3 (monorepo, un único despliegue de Frontend por app).

Grupos de rutas por rol, no aplicaciones independientes:
- Grupo público (sin autenticación).
- Grupo de acceso (registro, login, recuperación).
- Grupo de comprador (autenticado, rol comprador).
- Grupo de bodega (autenticado, rol bodega).
- Grupo de administrador (autenticado, rol administrador).
- Rutas de sistema (errores).

App Router permite definir, por grupo de rutas: un `layout` propio (§6), archivos de `loading` para los estados de carga (§13) y archivos de `error` para el manejo de errores (§12), sin duplicar esta lógica pantalla por pantalla.

## 4. Organización de carpetas

Descripción conceptual, sin nombres de archivo de código:
- **Rutas públicas**: Inicio, Catálogo, Ficha de vino, Ficha de bodega (PT-PUB-001 a 004).
- **Rutas de acceso**: Registro comprador, Registro bodega, Login, Recuperación, Nueva contraseña (PT-ACC-001 a 005).
- **Rutas de comprador**: Mi Cuenta, Carrito, Checkout, Pago, Confirmación, Mis pedidos, Detalle de pedido (PT-COM-001 a 007).
- **Rutas de bodega**: Panel, Perfil, Vinos, Crear vino, Editar vino, Detalle de vino, SubPedidos, Detalle de SubPedido (PT-BOD-001 a 008).
- **Rutas de administrador**: Dashboard, Validación de bodegas, Detalle de bodega, Revisión de vinos, Detalle de vino, Pedidos, Detalle de pedido, Incidencias, Detalle de incidencia (PT-ADM-001 a 009).
- **Rutas de sistema**: Error general, No encontrado, Acceso no autorizado (PT-SIS-001 a 003).
- **Componentes compartidos** (§17).
- **Servicios de integración**: cliente de la API de INF-08, cliente de base de datos/sesión (§20), cliente de redirección a Stripe Checkout (§21).
- **Internacionalización**: recursos de idioma (ES/EN/FR/DE/IT).
- **Estado de carrito de visitante**: módulo de cliente independiente (ver §10 y ADR-001, ya aprobado).

## 5. Sistema de rutas

Cada pantalla de CAP-05 corresponde a una única ruta. Las rutas de comprador, bodega y administrador son mutuamente excluyentes según `usuario.rol` (INF-05 v1.2), conforme a FL-SIS-002 (Controlar acceso por rol). Las rutas con parámetro (ficha de vino, ficha de bodega, detalle de pedido, detalle de SubPedido, detalle de incidencia) usan el identificador del recurso, alineado con las rutas de INF-08 v2.1 (p. ej. `/vinos/{id}` → API-010).

## 6. Layouts

Cinco layouts, uno por grupo de rutas:
1. **Público**: navegación a catálogo, registro, login, carrito.
2. **Acceso**: formulario centrado, sin navegación completa.
3. **Comprador**: navegación a Mi Cuenta, Mis pedidos, catálogo, carrito.
4. **Bodega**: navegación al panel, vinos, SubPedidos.
5. **Administrador**: navegación al dashboard, bodegas, vinos, pedidos, incidencias.

Las rutas de sistema (PT-SIS-001 a 003) no llevan navegación de rol; ofrecen solo volver a una zona segura (FL-SIS-007).

## 7. Navegación

Sigue exactamente las relaciones de navegación descritas en cada pantalla de CAP-05; no se añaden accesos no descritos. Tras iniciar sesión, redirige según el rol (Comprador → Mi Cuenta; Bodega → Panel; Administrador → Dashboard), conforme a CAP-03 Módulo 1 y FL-COM-002/FL-BOD-003/FL-ADM-001.

## 8. Autenticación

Conforme a INF-07 v1.2 §5 e INF-05 v1.2: la autenticación se basa en `usuario.email` y `usuario.password_hash` (hash gestionado por el backend, no por el Frontend), sirviendo CU-001 (registro comprador), CU-002 (login), CU-003 (recuperación) y CU-012 (registro de bodega). El Frontend gestiona:
- Formularios de registro, login y recuperación (PT-ACC-001 a 005).
- Persistencia de sesión entre navegaciones.
- Redirección tras login según el flujo interrumpido (p. ej. continuar checkout, FL-COM-002).

**Recuperación de contraseña (INF-05 v1.2):** el Frontend ya no depende de tokens almacenados en `usuario`; el flujo se apoya en la entidad `solicitud_recuperacion_password` (token con hash, estado, fechas de creación/expiración/uso), consistente con API-003/API-004 (INF-08 v2.1). El Frontend no implementa hashing ni validación de token: solo envía y recibe a través de la API.

El Frontend no implementa lógica de verificación de credenciales ni de hashing: es responsabilidad exclusiva del backend.

## 9. Autorización por roles

Cada grupo de rutas valida que el usuario autenticado tiene el rol correspondiente (`usuario.rol`), redirigiendo a login o a PT-SIS-003 (Acceso no autorizado) en caso contrario (FL-SIS-002). Esta validación en el Frontend es una capa de experiencia de usuario; la autorización real ocurre en el backend (INF-08, "Actor autorizado" por endpoint). Una bodega no validada no debe poder operar en su panel (CAP-02 v1.1, reglas de integridad de Bodega).

## 10. Gestión de estado

Sin librería de gestión de estado global compleja (CAP-03, principio de simplicidad). Se distinguen tres estados:
- **Estado de sesión** (usuario autenticado, rol): disponible globalmente.
- **Estado de servidor** (catálogo, pedidos, vinos, SubPedidos, incidencias): se obtiene bajo demanda desde la API de INF-08 en cada pantalla; no se duplica en un almacén global.
- **Carrito de visitante (Decisión de negocio 0010; ADR-001, `docs/ADR/ADR-001-Carrito-de-visitante.md`):** el carrito de un visitante sin cuenta se mantiene **únicamente en el cliente** (navegador), sin crear fila en la tabla `carrito` (que exige `comprador_id NOT NULL`, INF-05 v1.2 — sin cambio de esquema). Al iniciar sesión o registrarse, el sistema valida precio, publicación y disponibilidad de cada línea, y fusiona o copia el carrito local al carrito persistente del comprador. El checkout siempre exige autenticación (CU-009). Decisión cerrada.

No se diseña aquí una solución técnica específica de gestión de estado (fuera de alcance: "no escribas código").

## 11. Gestión de formularios

Formularios del MVP, correspondientes a flujos aprobados:
- Registro de comprador: fecha de nacimiento, declaración de mayoría de edad y aceptación de condiciones de compra de alcohol (CU-001, FL-COM-001; ver §5 en detalle).
- Registro de bodega (CU-012, FL-BOD-001).
- Login y recuperación de contraseña (CU-002/003).
- Completar perfil de bodega (CU-014, FL-BOD-004).
- Crear y editar vino (CU-015/016, FL-BOD-005/006).
- Checkout: dirección de envío (CU-009, FL-COM-010).

Los formularios validan en el cliente los mismos requisitos obligatorios que exige el backend, como ayuda a la experiencia de usuario; la validación autoritativa siempre ocurre en el backend (INF-08/INF-06).

## 12. Gestión de errores

Se reutilizan las pantallas de sistema de CAP-05:
- **PT-SIS-001 (Error general)**: errores no recuperables, de conexión o de carga (FL-SIS-007).
- **PT-SIS-002 (No encontrado)**: recursos inexistentes o despublicados (FL-SIS-006).
- **PT-SIS-003 (Acceso no autorizado)**: bloqueos por rol o propiedad del recurso (FL-SIS-002/006).

En App Router, cada grupo de rutas define su propio manejo de error, evitando que un fallo en un área (p. ej. Bodega) rompa la navegación de otra. La navegación de salida desde cualquier error respeta el rol del usuario. Un error de pago nunca se muestra como confirmación de Pedido (FL-SIS-003, API-018).

## 13. Gestión de estados de carga

CAP-05 define cuatro estados por pantalla: **Vacío, Cargando, Correcto, Error**. El Frontend los implementa de forma consistente en cada pantalla (p. ej. catálogo vacío, carrito vacío, sin resultados de búsqueda, sin Pedidos, sin incidencias), usando los mecanismos de `loading` de App Router para evitar bloquear la navegación completa mientras carga una sección. No se añaden estados no contemplados en CAP-05.

## 14. Internacionalización (i18n)

Conforme a Decision Log (Decisión de internacionalización) e INF-07 v1.2 §2.1, y CAP-03 Módulo 3 / CAP-04 FL-SIS-001:
- Detección del idioma del navegador cuando sea posible.
- Selección manual de otro idioma disponible **antes de finalizar el registro**.
- Idiomas soportados: español, inglés, francés, alemán, italiano — necesarios por ser Teralya un marketplace **europeo** (CAP-02 v1.1, objetivo del documento).
- Preferencia asociada a la cuenta (`usuario.idioma`, INF-05).

**Fuera de alcance:** traducción automática, IA aplicada a idioma, traducción de contenido de vinos/bodegas. La selección de idioma no sustituye la validación de edad ni la aceptación de condiciones de compra de alcohol.

## 15. Responsive

CAP-03 excluye la aplicación móvil nativa, no el uso del sitio web desde dispositivos móviles. El Frontend debe ser utilizable en anchos habituales de escritorio y móvil, condición base de cualquier aplicación web pública; no constituye funcionalidad nueva. No se diseña comportamiento específico adicional por dispositivo.

## 16. Accesibilidad

Prácticas básicas ya implícitas en la documentación aprobada:
- Texto alternativo obligatorio en imágenes (`imagen.alt_text`, regla de negocio INF-05/06).
- Los cuatro estados de pantalla (§13) deben ser comprensibles y navegables.
- Mensajes de error comprensibles (FL-SIS-007).

## 17. Componentes reutilizables

Conceptos que se repiten entre pantallas de CAP-05 (nombrados, no diseñados en detalle):
- Tarjeta de vino (Catálogo, Búsqueda, Ficha de bodega).
- Tarjeta/resumen de bodega (Ficha de bodega, Inicio).
- Línea de carrito (Carrito, Checkout).
- Indicador de estado de Pedido/SubPedido/Incidencia.
- Selector de idioma (pantallas de acceso).
- Formulario de dirección de envío (Checkout).
- Listado con estados vacío/cargando/error (catálogo, SubPedidos, Pedidos, incidencias, bodegas pendientes).

## 18. Convenciones de nombres

Se usa el vocabulario de dominio ya establecido en español, tal como aparece en el esquema y en las entidades (`Pedido`, `SubPedido`, `Bodega`, `Vino`, `Carrito`, `Checkout`, `Comprador`, `Incidencia`). No se traducen ni renombran estos conceptos en la interfaz ni en la documentación técnica del Frontend.

## 19. Integración con las APIs definidas en INF-08

Cada pantalla consume exclusivamente los endpoints de INF-08 v2.1 que le corresponden. Correspondencias directas:
- PT-PUB-002 (Catálogo) → API-009. PT-PUB-003 (Ficha de vino) → API-010.
- PT-COM-002 (Carrito) → API-011 a API-015 (solo comprador autenticado; ver §10 para visitante).
- PT-COM-003/004/005 (Checkout, Pago, Confirmación) → API-016, API-017, API-018 — **el Frontend debe evitar reintentos manuales redundantes**: API-016 ya es idempotente por carrito activo con Pedido `pendiente_pago`, y API-017 es idempotente por `pedido_id` (devuelve la misma URL de sesión mientras sea válida), conforme a INF-08 v2.1.
- PT-COM-006/007 (Mis pedidos, Detalle) → API-019, API-020.
- PT-BOD-004/005 (Crear/Editar vino) → API-007, API-008.
- PT-BOD-007/008 (SubPedidos) → API-021, API-022, API-023.
- PT-ADM-001 (Dashboard) → API-028. PT-ADM-002 (Validación de bodegas) → API-024. PT-ADM-004/005 (Revisión/Publicación de vinos) → API-025, API-026.

El Frontend no reimplementa reglas de negocio ya resueltas por estos endpoints (cálculo de totales, reparto de pago, transición de estados, idempotencia).

## 20. Integración con base de datos y sesión

Conforme a la Decisión de negocio 0011 (ADR-002, `docs/ADR/ADR-002-Proveedor-de-identidad.md`): la autenticación del MVP es autogestionada por el backend de Teralya (`usuario.password_hash`, hashing bcrypt/argon2, INF-05 v1.2/INF-07 v1.2 §5); no se adopta un proveedor de identidad externo gestionado en esta fase. En consecuencia, el Frontend gestiona la sesión emitida por el backend propio (INF-08) y nunca accede directamente a las tablas de negocio (vinos, pedidos, SubPedidos, bodegas) fuera de la API — evitando duplicar validación de reglas de negocio en el cliente. Cualquier adopción futura de un proveedor gestionado requiere un nuevo ADR (ADR-002).

## 21. Integración con Stripe Checkout

Conforme a CU-010, FL-COM-011 e INF-08 v2.1 (API-017/API-018/API-029):
1. El Frontend llama a API-017 tras un checkout válido (idempotente por `pedido_id`).
2. Redirige al comprador a la URL de sesión de Stripe Checkout devuelta.
3. Stripe procesa el pago y redirige de vuelta a Teralya.
4. El Frontend consulta API-018 para mostrar la Confirmación (PT-COM-005) únicamente si el pago fue aprobado.

El Frontend nunca confirma un Pedido por sí mismo: la confirmación autoritativa llega al backend mediante el webhook de Stripe (API-029, procesamiento idempotente por diseño).

## 22. Reglas obligatorias de desarrollo Frontend

1. Ninguna pantalla se construye sin un código PT-XXX en CAP-05.
2. Ninguna llamada a la API se hace a un endpoint fuera de INF-08 v2.1.
3. Ninguna validación de negocio se implementa solo en el Frontend sin respaldo del backend.
4. No se construyen funcionalidades excluidas en CAP-03 (favoritos, wishlist, reseñas, chat, CRM, club, subastas, app móvil, IA, traducción automática).
5. La bodega nunca publica ni despublica vinos desde su panel (CU-023/024 son exclusivas de Administrador); solo puede solicitar publicación (CU-017).
6. El comprador nunca ve ni gestiona SubPedidos como unidad propia; solo el Pedido completo (CAP-03 Módulo 11).
7. El dashboard de administrador nunca muestra más de los dos indicadores aprobados (CU-026).
8. El carrito de visitante nunca se persiste en `carrito`; solo tras autenticación (§10, ADR-001).
9. El Frontend nunca reintenta checkout/pago asumiendo que cada intento crea un recurso nuevo: debe respetar la idempotencia de API-016/API-017.

## 23. Dependencias

- **INF-08 v2.1** — contrato de API.
- **INF-05 v1.2 / INF-06 v1.1** — modelo de datos (17 tablas, incluida Incidencia y solicitud de recuperación de contraseña).
- **CAP-05** — inventario de pantallas.
- **CAP-06** — Casos de Uso.
- **PostgreSQL 16** (INF-07 §2) — base de datos subyacente.
- **Stripe Checkout** — procesamiento de pago.

## 24. Riesgos técnicos

- **Desincronización Pedido/SubPedido**: mitigado siguiendo estrictamente §19 (API-020 para Pedido completo del comprador; API-022/023 para SubPedido de bodega).
- **Confirmación de pago prematura**: mitigado no confirmando sin respuesta positiva de API-018/webhook.
- **Scope creep en i18n**: mitigado aplicando estrictamente el límite de §14.
- **Autorización solo en el cliente**: mitigado por §9 (autorización real siempre en backend).
- **Reintento de checkout/pago sin respetar idempotencia**: si el Frontend ignora que API-016/017 son idempotentes y trata cada clic como una operación nueva, podría generar confusión de UI (mostrar "nuevo" Pedido cuando es el mismo). Mitigación: §19 y §22.9.
- **Migración futura de proveedor de identidad**: si en el futuro se decide adoptar un proveedor gestionado, afectará simultáneamente a INF-05, INF-08 e INF-09; mitigación: exigir un nuevo ADR antes de tocar cualquiera de los tres (ADR-002).

## 25. Recomendaciones para la implementación

1. Construir primero el esqueleto de rutas y layouts de App Router (§3-§7) antes que ningún formulario o llamada a API.
2. Implementar primero el grupo público y de acceso (CU-001 a CU-006), puerta de entrada del producto.
3. Implementar el flujo completo de Comprador (catálogo → carrito de visitante → login/registro → fusión de carrito → checkout → pago → confirmación → pedidos) de principio a fin antes de Bodega o Administrador (CAP-03 Módulo 11).
4. Implementar después el panel de Bodega y, en último lugar, el área de Administrador (incluida gestión de incidencias).
5. Validar cada pantalla terminada contra su ficha exacta en CAP-05 antes de darla por cerrada.

---

## ADRs propuestos

Los ADR sobre carrito de visitante e identidad ya se cerraron como ADR-001 y ADR-002 (`docs/ADR/`) durante la auditoría de coherencia. Queda un único punto propuesto, sin cerrar:

1. **Next.js: App Router vs. Pages Router.** Este documento asume App Router (§3) por ser el estándar actual y por su ajuste natural a layouts/loading/error por grupo de rutas (§6, §12, §13); no existe decisión previa del CTO al respecto. Se recomienda fijarlo formalmente antes de iniciar la implementación.

---

*INF-09 – Arquitectura Frontend. Documento de arquitectura, sin código, 25 apartados. Basado en la línea base documental cerrada mediante auditoría de coherencia conjunta (CAP-02/05/06/07/08, INF-05/06/07/08, Decision Log, ADR-001, ADR-002). Sin contradicciones bloqueantes. Estado: EN REVISIÓN. Pendiente de aprobación del CTO.*
