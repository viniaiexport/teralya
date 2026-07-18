# INF-07 — Arquitectura Técnica Consolidada (Documento Maestro)

**Teralya · Versión 1.5 · 17/07/2026 · Estado: APROBADO POR EL CTO Y EL CEO**

Consolida INF-01 (stack tecnológico), INF-02 (repositorios), INF-03 (entorno cloud), INF-04 (CI/CD), INF-05 (esquema de base de datos) e INF-06 (diccionario de datos) en una única referencia técnica. Esta versión sustituye a INF-07 v1.4, conserva ADR-006 e incorpora el cierre técnico de cancelación contractual, condiciones de envío y migraciones de INF-05 v1.5. No cambia la topología ni amplía el alcance comercial del MVP.

## Índice

0. Cómo usar este documento · 1. Principios de arquitectura · 2. Stack tecnológico · 2.1 Internacionalización · 3. Repositorios y topología · 4. Entorno cloud y despliegue · 5. Seguridad · 5.1 Verificación de mayoría de edad · 6. Escalabilidad y monitorización · 7. Modelo de datos — resumen · 8. Decisiones y contradicciones cerradas · 9. Estado de cierre y alcance pendiente

---

## 0. Cómo usar este documento

Este es el documento **índice y de consolidación**: reúne las decisiones aprobadas de INF-01 a INF-06 y los ADR técnicos vigentes en una narrativa coherente. No sustituye a los documentos fuente para el detalle exhaustivo:

- El DDL ejecutable completo vive en `docs/INF/teralya_schema_v1.5_APROBADO.sql`.
- La descripción campo a campo vive en INF-06 v1.3 y su addendum INF-06-B v1.0.
- El contrato funcional de APIs vive en INF-08.
- La arquitectura detallada del Frontend vive en INF-09.
- El historial de decisiones vive en `docs/DECISION_LOG/Decision_Log.md`.

Cualquier cambio al modelo de datos se hace primero en INF-05/INF-06; cualquier cambio al contrato de API se hace en INF-08; cualquier cambio transversal de arquitectura requiere un ADR.

---

## 1. Principios de arquitectura

- **Simplicidad antes que sofisticación.** MVP con servicios claramente delimitados, sin microservicios prematuros.
- **Fiabilidad ante todo.** El dominio de pagos y pedidos exige consistencia por encima de velocidad de desarrollo.
- **Diseño antes que desarrollo.** Ninguna funcionalidad relevante entra en código sin documentación aprobada.
- **Desacoplamiento por dominio, no por moda tecnológica.** Catálogo, pedidos, pagos, comunicación y autenticación son límites de responsabilidad, no necesariamente despliegues separados.
- **Una sola fuente de verdad por decisión.** Las divergencias entre documentos se resuelven mediante ADR y actualización de las referencias dependientes.

**Visión general:** arquitectura modular monolítica para el backend y una única aplicación Frontend para el MVP. El backend se organiza en módulos de dominio con fronteras claras y puede evolucionar hacia servicios independientes cuando el volumen lo justifique. El Frontend se separa por rutas, layouts y permisos, no mediante aplicaciones duplicadas.

---

## 2. Stack tecnológico aprobado

| Capa | Elección | Motivo |
|---|---|---|
| Backend | Node.js + TypeScript sobre framework tipo NestJS/Express | Tipado fuerte, ecosistema maduro e integración con Stripe SDK |
| Frontend único | Next.js con App Router, React + TypeScript | Un único despliegue, reutilización de sesión, componentes e internacionalización; ADR-003 y ADR-004 |
| Base de datos | PostgreSQL 16 | Transaccionalidad ACID crítica para pedidos y pagos |
| Cola de trabajos | Redis + BullMQ o equivalente | Notificaciones, webhooks y reintentos |
| Pagos | Stripe Connect | Reparto de pagos multi-bodega |
| Imágenes | Object storage compatible con S3 + CDN | Coste bajo y escalado automático |
| Infraestructura | Hetzner Cloud + Cloudflare + R2 UE | Coste proporcionado, portabilidad y reutilización del contrato S3; ADR-006 |
| CI/CD | GitHub Actions | Integración directa con el repositorio |
| Observabilidad | Logging estructurado + APM | Detección rápida de incidencias críticas |

### 2.1 Internacionalización

Idiomas iniciales del MVP: español, inglés, francés, alemán e italiano.

El sistema debe detectar el idioma del navegador cuando sea posible, permitir cambio manual, guardar la preferencia en `usuario.idioma` y mostrar la interfaz en el idioma seleccionado.

Quedan fuera del alcance de esta decisión la traducción automática y el diseño del sistema de traducción de contenido de vinos o bodegas.

---

## 3. Repositorios y topología

**Decisión vigente:** Teralya utiliza un monorepo que contiene:

1. Un backend Node.js/TypeScript organizado por módulos de dominio.
2. Una única aplicación Frontend Next.js con App Router.
3. Infraestructura como código, configuración de CI/CD y paquetes compartidos cuando sean necesarios.

El Frontend único contiene grupos de rutas independientes para público, acceso, comprador, bodega, administrador y sistema. Cada área dispone de su propio layout y navegación. Existe un único despliegue Frontend para el MVP.

La autorización real se valida en el backend. La separación por rutas en el cliente mejora la experiencia de usuario, pero nunca sustituye el control de rol, permisos, validación de bodega y propiedad del recurso en cada endpoint.

Esta topología sustituye expresamente la referencia histórica de INF-07 v1.2 a dos frontends React. La decisión está registrada en ADR-004.

La estructura detallada de rutas y componentes se define en INF-09. La herramienta concreta de gestión del monorepo, como Turborepo o Nx, se decidirá durante la implementación solo si aporta valor real; no constituye una decisión funcional.

---

## 4. Entorno cloud y despliegue

| Entorno | Propósito | Despliegue |
|---|---|---|
| Local | Desarrollo individual | Docker Compose |
| Staging | Integración y pruebas end-to-end | Automático tras merge aprobado a `main` |
| Producción | Servicio real | Manual y aprobado tras superar staging |

El MVP tendrá un despliegue de backend y un despliegue de Frontend por entorno. Cada despliegue a producción requiere pipeline verde, revisión de código aprobada y ausencia de incidencias críticas relacionadas con el cambio.

La infraestructura se gestiona como código para evitar configuraciones divergentes entre staging y producción.

Hetzner Cloud ejecuta el MVP conforme a ADR-006. Cloudflare proporciona DNS, proxy, TLS, CDN y controles de borde; R2 bajo jurisdicción `eu` almacena imágenes y otros objetos. GitHub Actions construye imágenes Docker inmutables y GHCR las distribuye. Lovable no forma parte de la ruta crítica de producción.

El piloto puede ejecutarse temporalmente en un nodo único con servicios aislados en redes Docker. Antes de actividad comercial relevante se separará PostgreSQL en un nodo privado, se activará archivado WAL continuo y se añadirán nodos de aplicación o balanceador cuando las métricas lo requieran. AWS se conserva como destino futuro de migración, no como plataforma activa.

---

## 5. Seguridad

- Todo el tráfico utiliza HTTPS/TLS.
- Los datos de tarjeta no se almacenan en la base de datos propia; Stripe Checkout gestiona su captura.
- Las contraseñas se almacenan con hashing fuerte, nunca en texto plano ni en logs.
- La recuperación utiliza `solicitud_recuperacion_password`, con token persistido solo como hash, estado y fechas de ciclo de vida.
- La recuperación no revela públicamente si un email está registrado.
- El backend verifica autenticación, rol, permisos, validación de bodega y propiedad del recurso en cada endpoint.
- Los endpoints públicos y de autenticación aplican rate limiting.
- Los secretos se gestionan mediante un servicio dedicado y no se guardan en el repositorio.
- Los datos personales se minimizan y se preparan para exportación y borrado conforme al RGPD.

### 5.1 Verificación de mayoría de edad

La validación de mayoría de edad es obligatoria en el registro de comprador. El comprador debe introducir su fecha de nacimiento, declarar que cumple la edad mínima aplicable y aceptar las condiciones de compra de alcohol.

El sistema impide el registro cuando no se cumple la edad mínima y conserva las aceptaciones, sus fechas y la versión de las condiciones. No se implementa verificación documental de identidad en el MVP.

---

## 6. Escalabilidad y monitorización

El MVP se dimensiona para el volumen previsto del primer año. La arquitectura evita bloqueos estructurales para escalar posteriormente mediante réplicas de lectura, instancias adicionales de backend o extracción de módulos cuando exista una necesidad demostrada.

Se configuran alertas para errores 5xx sostenidos, fallos de pago, colas bloqueadas y webhooks no procesados. El panel administrativo mantiene únicamente los indicadores funcionales aprobados para el MVP; las métricas técnicas viven en observabilidad y no amplían el producto.

---

## 7. Modelo de datos — resumen

El modelo vigente consta de 20 tablas en PostgreSQL 16:

| # | Tabla | Propósito |
|---|---|---|
| 1 | `bodega` | Empresa productora que vende en el marketplace |
| 2 | `usuario` | Identidad única de acceso |
| 3 | `comprador` | Extensión 1:1 del usuario comprador |
| 4 | `cuenta_stripe_connect` | Vinculación de bodega con Stripe Connect |
| 5 | `vino` | Producto de una bodega |
| 6 | `imagen` | Imágenes de vino o bodega |
| 7 | `direccion` | Direcciones de comprador o bodega |
| 8 | `carrito` | Selección temporal autenticada |
| 9 | `carrito_item` | Línea de carrito |
| 10 | `carrito_fusion` | Ledger idempotente de fusión de carrito |
| 11 | `pedido` | Compra global multi-bodega |
| 12 | `pago` | Registro económico de la compra |
| 13 | `evento_webhook_stripe` | Ledger idempotente de webhooks Stripe |
| 14 | `subpedido` | Parte del pedido por bodega y fuente logística |
| 15 | `pedido_item` | Línea congelada del pedido |
| 16 | `incidencia` | Problema operativo básico |
| 17 | `notificacion` | Comunicación automática |
| 18 | `auditoria` | Registro inmutable de eventos |
| 19 | `solicitud_recuperacion_password` | Recuperación segura de acceso |
| 20 | `cancelacion_pedido` | Ledger idempotente de cancelación contractual y reembolso |

El detalle ejecutable permanece en INF-05 y el detalle campo a campo en INF-06.

---

## 8. Decisiones y contradicciones cerradas

1. Modelo de usuario único en `usuario`; comprador como extensión 1:1; bodega independiente; administrador como rol.
2. Pago sin FK directa a Stripe Connect; el reparto se resuelve por SubPedido y Bodega.
3. Relación 1:N entre Bodega y Usuario para permitir varios usuarios autorizados.
4. `subpedido.estado` como única fuente del flujo logístico.
5. Mayoría de edad obligatoria sin verificación documental en el MVP.
6. Interfaz en ES/EN/FR/DE/IT; traducción automática fuera del alcance.
7. Incidencia operativa básica persistida, sin CRM, chat ni ticketing avanzado.
8. Recuperación separada en `solicitud_recuperacion_password` y sin enumeración de cuentas.
9. Autenticación gestionada por el backend de Teralya en el MVP, conforme a ADR-002.
10. Next.js con App Router como framework Frontend, conforme a ADR-003.
11. Una única aplicación Frontend y un único despliegue Frontend para el MVP, conforme a ADR-004.
12. La cancelación directa se ejecuta mediante API-051 y `cancelacion_pedido`; solo un reembolso Stripe confirmado aplica cancelación comercial y restitución de stock.
13. Las condiciones de envío se editan en el perfil existente de Bodega y se publican mediante API-030, sin integrar un nuevo motor logístico.

---

## 9. Estado de cierre y alcance pendiente

**INF-07 v1.5 queda APROBADO POR EL CTO Y EL CEO y sustituye a INF-07 v1.4.**

### Cerrado técnicamente

- Backend modular NestJS y Frontend único Next.js mantienen la topología aprobada.
- Contrato API v1.1: 51 operaciones, 42 rutas, 11 módulos y 76 schemas.
- Esquema PostgreSQL v1.5: 20 tablas y migración incremental idempotente.
- Cancelación contractual integrada en Pedido/Pago/Stripe/stock/notificación.
- Condiciones de envío integradas en perfil propio y ficha pública de Bodega.
- Despliegues de staging y producción aplican la migración antes de levantar la nueva aplicación.

### Frente operativo activo

OPS-01 — Activación y validación de staging. El código no convierte el entorno en operativo por sí solo: siguen siendo necesarias las credenciales reales de Hetzner, Cloudflare R2, SMTP y Stripe, el firewall Cloudflare-only y `STAGING_DEPLOY_ENABLED=true`.

### Gates antes de producción

- CI y E2E de la rama de cierre en verde.
- Staging real validado con recorridos de todos los roles.
- Aprobación de Seguridad de límites de autenticación y recuperación.
- Política operativa ante cobro confirmado sin stock aprobada por el CEO.
- Revisión legal/fiscal externa antes de operación multi-país a escala.
- Pruebas de rendimiento, seguridad y restauración de backups.

*Documento aprobado. Cualquier cambio transversal exige un nuevo ADR; cualquier ampliación del MVP exige aprobación expresa del CEO.*
