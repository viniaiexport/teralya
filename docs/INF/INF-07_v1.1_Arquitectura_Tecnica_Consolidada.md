# INF-07 — Arquitectura Técnica Consolidada (Documento Maestro)

**Teralya · Versión 1.1 · Julio 2026 · Preparado por Claude**
Consolida INF-01 (stack tecnológico), INF-02 (repositorios), INF-03 (entorno cloud), INF-04 (CI/CD), INF-05 (esquema de base de datos) e INF-06 (diccionario de datos) en una única referencia técnica. Incorpora además dos decisiones del CTO del 09/07/2026 (§2.1 y §5.1). No modifica ninguna decisión previa, no añade funcionalidad no aprobada, no diseña APIs ni servicios nuevos. Esta versión sustituye a la v1.0.

## Índice

0. Cómo usar este documento · 1. Principios de arquitectura · 2. Stack tecnológico (INF-01) · 2.1 Internacionalización · 3. Repositorios (INF-02) · 4. Entorno cloud y despliegue (INF-03 / INF-04) · 5. Seguridad · 5.1 Verificación de mayoría de edad · 6. Escalabilidad y monitorización · 7. Modelo de datos — resumen (INF-05 / INF-06) · 8. Decisiones y contradicciones cerradas · 9. Estado de cierre y alcance pendiente

---

## 0. Cómo usar este documento

Este es el documento **índice y de consolidación**: reúne las decisiones ya aprobadas de INF-01 a INF-06 en una sola narrativa coherente, y elimina las duplicidades que existían al tener esas decisiones repartidas en varios documentos. No sustituye a los documentos fuente para el detalle exhaustivo:

- El **DDL ejecutable completo** (15 tablas, constraints, índices) vive en `teralya_schema_v1.1_APROBADO.sql`.
- La **descripción campo a campo** vive en "Diccionario de Datos - INF-06".
- El **historial de decisiones con fecha y motivo** vive en "Decision Log - Teralya".
- Este documento **no reproduce ese detalle** para evitar que los contenidos diverjan con el tiempo. Cualquier cambio al modelo de datos se hace primero en esos documentos; este maestro solo se actualiza después, a nivel de resumen.

---

## 1. Principios de arquitectura

- **Simplicidad antes que sofisticación.** MVP con servicios claramente delimitados, sin microservicios prematuros.
- **Fiabilidad ante todo.** El dominio de pagos y pedidos exige consistencia por encima de velocidad de desarrollo.
- **Diseño antes que desarrollo.** Ninguna funcionalidad relevante entra en código sin pasar antes por documentación aprobada.
- **Desacoplamiento por dominio, no por moda tecnológica.** Catálogo, pedidos, pagos y comunicación son límites de responsabilidad, no necesariamente despliegues separados en el MVP.

**Visión general (arquitectura modular monolítica):** un único despliegue de backend en el MVP, organizado internamente en módulos de dominio con fronteras claras (Catálogo, Pedidos, Pagos, Comunicación, Auth), preparado para extraerse a servicios independientes si el volumen lo justifica más adelante. Cada módulo expone su propia capa de servicio y su propio conjunto de tablas; se comunican entre sí a través de la capa de aplicación y de eventos internos, no accediendo directamente a las tablas de otro módulo.

---

## 2. Stack tecnológico aprobado (INF-01)

| Capa | Elección | Por qué |
|---|---|---|
| Backend | Node.js (TypeScript) sobre framework tipo NestJS/Express | Tipado fuerte, ecosistema maduro, buena integración con Stripe SDK |
| Frontend Comprador y Bodega | React + TypeScript | Estándar de facto, reutilización de componentes entre ambas apps |
| Base de datos | PostgreSQL 16 | Transaccionalidad ACID crítica para pedidos y pagos (ver §7) |
| Cola de eventos / trabajos asíncronos | Redis + cola de trabajos (BullMQ o equivalente) | Notificaciones, webhooks de Stripe y reintentos |
| Pagos | Stripe Connect | Único proveedor con reparto de pagos entre múltiples vendedores probado a escala |
| Almacenamiento de imágenes | Object storage (S3-compatible) + CDN | Coste bajo, escalado automático |
| Infraestructura | Proveedor cloud único (AWS o GCP) con IaC (Terraform) | Reproducibilidad de entornos |
| CI/CD | GitHub Actions | Integración directa con el repositorio |
| Observabilidad | Logging estructurado + APM (p. ej. Sentry) | Detectar incidencias de pago o pedido en minutos |

### 2.1 Internacionalización (Decisión CTO — 09/07/2026)

Teralya nace preparado para múltiples idiomas. **Idiomas iniciales del MVP:** español, inglés, francés, alemán, italiano.

El sistema debe:
- Detectar el idioma del navegador cuando sea posible.
- Permitir cambiar el idioma manualmente.
- Guardar el idioma preferido del usuario — el esquema aprobado ya contempla este dato (`usuario.idioma`, ver INF-05/INF-06), no requiere cambio de modelo.
- Mostrar la interfaz en el idioma seleccionado.

La arquitectura debe quedar preparada para soportar traducciones de contenido en el futuro. **Explícitamente fuera de alcance de esta decisión:** el diseño del sistema de traducción de fichas de vino o de bodega — se abordará como tarea propia cuando el CTO lo indique.

---

## 3. Repositorios (INF-02)

**Decisión registrada:** estructura de monorepo, cubriendo backend (Node.js/TypeScript) y los dos frontends React (Comprador y Panel Bodega), alineado con los límites de módulo del §1.

No existe, a fecha de este documento, un diseño detallado de estructura de carpetas, convenciones de paquetes o herramientas de gestión del monorepo (p. ej. Turborepo/Nx). No se improvisa aquí: definir esa estructura es trabajo de implementación que corresponde a una tarea propia (no incluida en el alcance de INF-07, que es de consolidación, no de diseño nuevo).

---

## 4. Entorno cloud y despliegue (INF-03 / INF-04)

| Entorno | Propósito | Despliegue |
|---|---|---|
| Local | Desarrollo individual | Docker Compose |
| Staging | Integración y pruebas end-to-end antes de cada release | Automático en cada merge a `main` |
| Producción | Servicio real a bodegas y compradores | Manual/aprobado, tras superar staging |

Cada despliegue a producción requiere: pipeline verde (tests + linter), revisión de código aprobada, y ausencia de incidencias críticas abiertas relacionadas con el cambio. La infraestructura se gestiona como código (IaC) para evitar configuración manual divergente entre staging y producción.

---

## 5. Seguridad

- Todo el tráfico bajo HTTPS/TLS, sin excepciones, ni siquiera en staging.
- Datos de pago nunca tocan la base de datos propia: Stripe Elements/Checkout gestiona la captura de tarjeta.
- Contraseñas con hashing fuerte (bcrypt/argon2); nunca en texto plano ni en logs — decisión que además queda reflejada a nivel de esquema en `usuario.password_hash` (INF-05).
- Control de acceso por rol verificado en cada endpoint, no solo en el frontend — el modelo de rol único de `usuario.rol` (comprador/bodega/administrador) es la base de este control (ver §7 y §8, Contradicción 1).
- Rate limiting en endpoints públicos y de autenticación.
- Gestión de secretos vía servicio dedicado, no variables de entorno en claro en el repositorio.
- Cumplimiento RGPD: datos personales minimizados, con posibilidad de exportación y borrado bajo solicitud.

### 5.1 Verificación de mayoría de edad (Decisión CTO — 09/07/2026)

La validación de mayoría de edad es **obligatoria** en el registro de comprador. Durante el registro, el comprador debe:
- Introducir su fecha de nacimiento.
- Declarar que es mayor de edad según la legislación aplicable.
- Aceptar las condiciones de compra de alcohol.

El sistema debe:
- Validar la edad mínima configurada.
- Impedir la creación de la cuenta si no se cumple.
- Registrar la aceptación y la fecha para auditoría — se apoya en la tabla `auditoria` ya existente (INF-05/INF-06), sin requerir tabla nueva.

**No se implementa en el MVP** una verificación documental de identidad.

*Nota técnica para futura revisión de INF-05 (no aplicada en este documento):* el esquema aprobado ya incluye `comprador.fecha_nacimiento`, marcado como opcional en el MVP. Esta decisión implica que, en la práctica, ese dato pasa a ser obligatorio en el flujo de registro. El esquema en sí no se modifica aquí — queda anotado para que el CTO lo revise formalmente en una futura versión de INF-05.

---

## 6. Escalabilidad y monitorización

El MVP se dimensiona para el volumen proyectado del primer año (hasta ~3.500 pedidos/mes hacia el mes 12, según el Blueprint Cap. 11). La base de datos y el backend se diseñan sin bloqueos estructurales para escalar horizontalmente (réplicas de lectura, instancias adicionales de backend) cuando el volumen lo requiera.

Alertas automáticas ante: caída de la tasa de éxito de pago por debajo de un umbral, error 5xx sostenido, cola de trabajos asíncronos estancada. Panel de métricas de negocio básico (pedidos/día, GMV/día, incidencias abiertas) accesible al equipo fundador.

---

## 7. Modelo de datos — resumen (INF-05 / INF-06)

15 tablas en PostgreSQL 16, aprobadas y verificadas contra una instancia real (ver `teralya_schema_v1.1_APROBADO.sql` para el DDL, "Diccionario de Datos - INF-06" para el detalle campo a campo):

| # | Tabla | Propósito (una línea) |
|---|---|---|
| 1 | `bodega` | Empresa productora de vino que vende en el marketplace. |
| 2 | `usuario` | Identidad única de cualquier persona con acceso a la plataforma. |
| 3 | `comprador` | Extensión 1:1 de usuario con los datos comerciales del cliente. |
| 4 | `cuenta_stripe_connect` | Vincula una bodega con Stripe Connect para cobrar. |
| 5 | `vino` | Producto comercializado por una única bodega. |
| 6 | `imagen` | Recursos gráficos polimórficos (vino o bodega). |
| 7 | `direccion` | Direcciones de envío/facturación polimórficas (comprador o bodega). |
| 8 | `carrito` | Selección temporal de vinos antes de confirmar el pedido. |
| 9 | `carrito_item` | Línea de producto dentro de un carrito. |
| 10 | `pedido` | Compra confirmada; agrupa productos de varias bodegas. |
| 11 | `pago` | Registro económico único de la compra, previo al reparto. |
| 12 | `subpedido` | Parte de un pedido por bodega; única fuente de verdad del flujo logístico. |
| 13 | `pedido_item` | Línea de pedido con snapshot congelado; solo excepciones normal/cancelado/devuelto. |
| 14 | `notificacion` | Comunicaciones automáticas enviadas a usuarios. |
| 15 | `auditoria` | Registro inmutable de eventos del sistema. |

---

## 8. Decisiones y contradicciones cerradas

Registro histórico consolidado — nada de esto se reabre en este documento, se deja constancia para quien llegue nuevo al proyecto (ver también "Decision Log - Teralya" para el historial completo con fechas):

1. **Modelo de usuario (Contradicción 1, cerrada por el CTO).** Usuario Base y Usuario se fusionaron en una única entidad `usuario`. Comprador es una extensión 1:1. Bodega es independiente, con relación 1:N hacia usuario. Administrador es solo un rol, sin tabla propia.
2. **Pago y Stripe Connect (Contradicción 2, corregida técnicamente).** No existe FK directa de `pago` a `cuenta_stripe_connect`: el reparto multi-bodega se resuelve vía `subpedido → bodega → cuenta_stripe_connect`.
3. **Multi-usuario por bodega (Contradicción 3, cerrada).** Resuelta implícitamente por la decisión 1: la relación 1:N bodega→usuario confirma que varios usuarios pueden pertenecer a una misma bodega.
4. **Estados duplicados PedidoItem/SubPedido (Contradicción 4, cerrada por el CTO).** `subpedido.estado` es la única fuente de verdad del flujo logístico. `pedido_item.estado` quedó reducido a `normal / cancelado / devuelto`, como excepción de línea.
5. **Verificación de mayoría de edad (Decisión CTO, 09/07/2026).** Obligatoria en el registro de comprador; sin verificación documental en el MVP. Ver §5.1.
6. **Plataforma multilingüe (Decisión CTO, 09/07/2026).** MVP en ES/EN/FR/DE/IT, con arquitectura preparada para traducción de contenidos futura. Ver §2.1.

---

## 9. Estado de cierre y alcance pendiente

**INF-01 a INF-06: consolidados y aprobados.** Este documento es la referencia técnica oficial del proyecto a fecha de julio de 2026.

**Explícitamente fuera de alcance de INF-07** (por instrucción directa del CTO): diseño de APIs, diseño de servicios, y escritura de código nuevo. Estos se abordarán en tareas futuras cuando el CTO lo indique. El diseño del sistema de traducción de contenidos (vinos/bodegas) queda igualmente fuera de alcance por instrucción explícita (§2.1).

*Documento en espera de nuevas instrucciones del CTO.*
