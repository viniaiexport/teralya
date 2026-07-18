# INF-09 – Arquitectura Frontend

**Teralya · Versión 1.1 · 17/07/2026 · Estado: APROBADO POR EL CTO · Cierre FE-008**

Documento de arquitectura del Frontend del MVP. Basado en CAP-01 a CAP-09, INF-05 v1.5, INF-06 v1.3 + INF-06-B, INF-07 v1.5, INF-08 v2.6, INF-10 v1.1, Decision Log 0010 a 0029 y ADR-001 a ADR-006. Conserva exactamente 25 apartados. No cambia framework, topología ni alcance comercial.

---

## 1. Objetivo

Definir la arquitectura técnica del Frontend del MVP de Teralya como consecuencia directa de CAP-05, CAP-09, INF-07 v1.5 y el contrato de API de INF-08 v2.6. Permite construir el Frontend sin tomar decisiones funcionales o arquitectónicas por cuenta propia.

## 2. Principios de arquitectura

- **Una pantalla del Frontend = una pantalla de CAP-05.** Ninguna vista se crea sin un código PT-XXX.
- **Cada pantalla debe ayudar a vender vino, generar confianza u operar el MVP.**
- **El Frontend no contiene lógica de negocio.** Edad, disponibilidad, transiciones, reparto de pagos, autorización e idempotencia son responsabilidad del backend.
- **Simplicidad como ventaja:** sin gestión de estado compleja ni abstracciones prematuras.
- **Separación por rol:** Comprador, Bodega y Administrador tienen navegación, layout y permisos diferenciados.
- **Modelo marketplace:** Teralya no compra ni almacena stock; cada bodega gestiona su catálogo, stock y envío.

## 3. Estructura completa del proyecto Next.js

El MVP utiliza una **única aplicación Next.js con App Router**, conforme a ADR-003 y ADR-004. La aplicación comparte componentes, cliente de API, autenticación e internacionalización, pero separa claramente las áreas por grupos de rutas.

Grupos de rutas:
- Público.
- Acceso.
- Comprador.
- Bodega.
- Administrador.
- Sistema.

Existe un único despliegue Frontend por entorno. La separación de seguridad se garantiza en el backend; los grupos de rutas y layouts son una separación de experiencia y organización del código.

App Router proporciona layouts, estados `loading` y límites de error por grupo de rutas sin duplicar la infraestructura en varias aplicaciones.

## 4. Organización de carpetas

Organización conceptual, sin imponer nombres de archivos:
- **Rutas públicas:** PT-PUB-001 a PT-PUB-004.
- **Rutas de acceso:** PT-ACC-001 a PT-ACC-005.
- **Rutas de comprador:** PT-COM-001 a PT-COM-007.
- **Rutas de bodega:** PT-BOD-001 a PT-BOD-008.
- **Rutas de administrador:** PT-ADM-001 a PT-ADM-009.
- **Rutas de sistema:** PT-SIS-001 a PT-SIS-003.
- Componentes compartidos.
- Servicios de integración con API, sesión y Stripe.
- Recursos de internacionalización ES/EN/FR/DE/IT.
- Estado local del carrito de visitante, conforme a ADR-001.

## 5. Sistema de rutas

Cada pantalla de CAP-05 corresponde a una ruta. Las áreas de Comprador, Bodega y Administrador son mutuamente excluyentes según `usuario.rol`. Las rutas parametrizadas utilizan el identificador del recurso. Las rutas y permisos del cliente nunca sustituyen la autorización del backend.

## 6. Layouts

Cinco layouts principales:
1. Público.
2. Acceso.
3. Comprador.
4. Bodega.
5. Administrador.

Las rutas de sistema no utilizan navegación de rol y ofrecen una salida hacia una zona segura.

## 7. Navegación

La navegación sigue las relaciones definidas en CAP-05. Tras iniciar sesión, el usuario se dirige al área correspondiente a su rol. Si el inicio de sesión interrumpe una acción permitida, como continuar el checkout, se conserva el destino válido.

## 8. Autenticación

La autenticación se basa en `usuario.email` y `usuario.password_hash`, gestionados exclusivamente por el backend conforme a ADR-002. El Frontend proporciona formularios, conserva la sesión emitida por el backend y redirige según rol.

La recuperación utiliza `solicitud_recuperacion_password`. El Frontend no realiza hashing ni revela si un email está registrado; solo envía y recibe información mediante API-003 y API-004.

## 9. Autorización por roles

Cada grupo de rutas comprueba el rol para ofrecer una experiencia correcta y redirigir accesos no permitidos. La autorización real ocurre en el backend en cada endpoint, incluyendo rol, permisos, validación de bodega y propiedad del recurso.

## 10. Gestión de estado

No se adopta una librería global compleja por defecto.

- **Sesión:** estado global mínimo del usuario autenticado y su rol.
- **Estado de servidor:** catálogo, pedidos, vinos, SubPedidos e incidencias obtenidos desde la API.
- **Carrito de visitante:** exclusivamente local en el navegador. Tras registro o login se revalidan precio, publicación y disponibilidad y se fusiona con el carrito persistente del comprador. El checkout requiere autenticación.

## 11. Gestión de formularios

Formularios del MVP:
- Registro de comprador con fecha de nacimiento y aceptaciones obligatorias.
- Solicitud de registro de bodega.
- Login y recuperación de contraseña.
- Perfil de bodega, incluidas sus condiciones de envío.
- Creación y edición de vino.
- Solicitud de publicación de vino.
- Checkout y dirección de envío.
- Actualización permitida de SubPedido e Incidencia.
- Confirmación explícita de cancelación contractual desde PT-COM-007.

La validación del cliente mejora la experiencia; la validación autoritativa siempre corresponde al backend.

## 12. Gestión de errores

Se reutilizan PT-SIS-001, PT-SIS-002 y PT-SIS-003. Cada grupo de rutas tiene su propio límite de error. Un fallo en un área no debe inutilizar las demás. Un error de pago nunca se representa como Pedido confirmado. Un error de reembolso nunca se representa como cancelación completada; el estado procede de API-020/API-051.

## 13. Gestión de estados de carga

Cada pantalla implementa los estados Vacío, Cargando, Correcto y Error definidos en CAP-05. App Router permite resolver la carga por sección sin bloquear toda la aplicación.

## 14. Internacionalización (i18n)

La interfaz soporta español, inglés, francés, alemán e italiano. Detecta el idioma del navegador cuando sea posible, permite selección manual y guarda la preferencia en `usuario.idioma`.

Quedan fuera de alcance la traducción automática, la IA aplicada a idioma y la traducción de contenido de vinos o bodegas.

## 15. Responsive

La aplicación web debe ser utilizable en escritorio y móvil. No se crea una aplicación móvil nativa ni comportamientos funcionales adicionales por dispositivo.

## 16. Accesibilidad

- Texto alternativo obligatorio en imágenes.
- Estados de pantalla comprensibles y navegables.
- Mensajes de error claros.
- Formularios y navegación operables mediante teclado y tecnologías de asistencia en el nivel exigible al MVP.
- Las acciones económicas o irreversibles exigen confirmación explícita y mensajes de estado con propósito claro.

## 17. Componentes reutilizables

- Tarjeta de vino.
- Tarjeta o resumen de bodega.
- Línea de carrito.
- Indicador de estado de Pedido, SubPedido o Incidencia.
- Selector de idioma.
- Formulario de dirección.
- Listado reutilizable con estados vacío, carga y error.
- Formulario de cancelación contractual con confirmación.
- Bloque público de condiciones de envío.

## 18. Convenciones de nombres

Se mantiene el vocabulario oficial del dominio: Pedido, SubPedido, Bodega, Vino, Carrito, Checkout, Comprador e Incidencia. La documentación y el código no deben inventar sinónimos funcionales.

## 19. Integración con las APIs definidas en INF-08

Las pantallas solo consumen endpoints documentados en INF-08. La arquitectura queda aprobada independientemente de la versión concreta del contrato, pero **no se implementará una pantalla cuya operación no disponga todavía de endpoint aprobado**.

Cobertura confirmada en INF-08 v2.6 aprobada:
- Autenticación y acceso por rol: API-001 a API-004.
- Bodegas y perfil público/propio, incluidas condiciones de envío: API-005, API-006, API-030 y API-031.
- Vinos públicos y propios: API-007 a API-010 y API-032 a API-034.
- Carrito autenticado: API-011 a API-015.
- Checkout, pago y confirmación: API-016 a API-018.
- Pedidos del comprador y cancelación contractual: API-019, API-020 y API-051.
- SubPedidos de bodega: API-021 a API-023.
- Administración: API-024 a API-028 y API-035 a API-042.
- Webhook de Stripe: API-029.
- Direcciones: API-043 a API-046.
- Imágenes: API-047 a API-050.

El contrato OpenAPI v1.1 cubre 51 operaciones y 42 rutas. No queda una pantalla del MVP sin contrato API aprobado.

## 20. Integración con base de datos y sesión

El Frontend nunca accede directamente a las tablas de negocio. Gestiona la sesión emitida por el backend y consume exclusivamente la API. Cualquier cambio futuro de proveedor de identidad exige un nuevo ADR.

## 21. Integración con Stripe Checkout

1. El Frontend solicita la preparación del Pedido.
2. Solicita o reutiliza la sesión de Stripe Checkout.
3. Redirige al comprador a Stripe.
4. Tras el retorno, consulta la confirmación.
5. Solo muestra confirmación cuando el backend ha validado el pago mediante webhook.

El Frontend nunca confirma un Pedido por sí mismo.

La cancelación contractual usa un flujo separado:
1. API-020 informa `puede_cancelar` y el estado persistido.
2. El Comprador confirma expresamente en PT-COM-007.
3. El Frontend llama a API-051 una sola vez por envío del formulario.
4. El Frontend no cancela, repone stock ni confirma el reembolso por su cuenta.
5. `procesando`, `completada` y `fallida` se representan según la respuesta del backend.

## 22. Reglas obligatorias de desarrollo Frontend

1. Ninguna pantalla se construye sin código PT-XXX.
2. Ninguna llamada se hace a un endpoint no aprobado en INF-08.
3. Ninguna regla de negocio vive únicamente en el Frontend.
4. No se implementan favoritos, wishlist, reseñas, chat, CRM, club, subastas, app móvil, IA ni traducción automática.
5. La Bodega no publica ni despublica vinos; solo solicita publicación.
6. El Comprador no gestiona ni recibe SubPedidos como unidad funcional; consulta exclusivamente la proyección agregada de su Pedido.
7. El dashboard administrativo se limita a los indicadores aprobados.
8. El carrito de visitante no se persiste antes de autenticación.
9. Checkout, pago y cancelación respetan la idempotencia y la autoridad económica del backend.
10. El Frontend nunca interpreta el retorno del navegador como confirmación de pago, reembolso o cancelación.
11. Las condiciones de envío se editan dentro de PT-BOD-002 y se publican en PT-PUB-003/PT-PUB-004; no crean una aplicación, pantalla ni motor logístico adicional.
12. Una pantalla sin contrato API aprobado permanece bloqueada para implementación, sin improvisar llamadas ni acceso directo a base de datos.

## 23. Dependencias

- INF-07 v1.5, ADR-003 y ADR-004 para stack y topología.
- INF-08 v2.6, INF-10 v1.1 e OpenAPI v1.1 para contrato de API.
- INF-05 v1.5 e INF-06 v1.3 + INF-06-B para modelo de datos.
- CAP-05 y CAP-09 para pantallas, cancelación y condiciones de envío.
- Stripe Checkout y Refunds para pago y reembolso.
- PostgreSQL 16 como base de datos subyacente.

## 24. Riesgos técnicos

- Desincronización Pedido/SubPedido.
- Confirmación de pago prematura.
- Ampliación indebida del alcance de internacionalización.
- Autorización implementada solo en cliente.
- Reintentos que ignoren idempotencia.
- Migración futura de identidad sin ADR.
- Implementación de pantallas sin endpoint aprobado. Mitigación: auditoría de cobertura de INF-08 y regla §22.12.
- División prematura del Frontend en varias aplicaciones. Mitigación: ADR-004.
- Presentar una cancelación como completada antes del reembolso. Mitigación: API-020/API-051 como únicas fuentes.
- Duplicar el envío de cancelación desde la interfaz. Mitigación: Server Action, confirmación y ledger backend.
- Publicar datos internos de Bodega junto con condiciones logísticas. Mitigación: proyecciones cerradas BodegaPublic/BodegaSelf.

## 25. Recomendaciones para la implementación

1. Mantener FE-001 a FE-008 congelados salvo defectos verificados.
2. Validar en staging los recorridos de Visitante, Comprador, Bodega y Administrador.
3. Probar cancelación satisfactoria, pendiente, fallida, replay y bloqueo logístico.
4. Verificar condiciones de envío con datos presentes y ausentes.
5. Medir accesibilidad, rendimiento y seguridad antes de producción.
6. No reabrir decisiones cerradas por ADR ni ampliar el MVP sin aprobación del CEO.

---

## ADRs

ADR-001, ADR-002, ADR-003 y ADR-004 están aceptados. No queda ninguna decisión arquitectónica pendiente en INF-09.

---

*INF-09 v1.1 — Arquitectura Frontend. 25 apartados. Estado: APROBADO POR EL CTO. FE-008 queda cerrado en código; el frente activo pasa a OPS-01 para activación de staging.*
