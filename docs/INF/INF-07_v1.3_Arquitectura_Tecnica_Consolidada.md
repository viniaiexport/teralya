# INF-07 — Arquitectura Técnica Consolidada (Documento Maestro)

**Teralya · Versión 1.3 · Julio 2026 · Estado: APROBADO POR EL CTO**

Consolida INF-01 (stack tecnológico), INF-02 (repositorios), INF-03 (entorno cloud), INF-04 (CI/CD), INF-05 (esquema de base de datos) e INF-06 (diccionario de datos) en una única referencia técnica. Esta versión sustituye a INF-07 v1.2 y añade exclusivamente la alineación de topología Frontend aprobada mediante ADR-003 y ADR-004. No añade funcionalidad ni modifica el alcance del MVP.

## Índice

0. Cómo usar este documento · 1. Principios de arquitectura · 2. Stack tecnológico · 2.1 Internacionalización · 3. Repositorios y topología · 4. Entorno cloud y despliegue · 5. Seguridad · 5.1 Verificación de mayoría de edad · 6. Escalabilidad y monitorización · 7. Modelo de datos — resumen · 8. Decisiones y contradicciones cerradas · 9. Estado de cierre y alcance pendiente

---

## 0. Cómo usar este documento

Este es el documento **índice y de consolidación**: reúne las decisiones aprobadas de INF-01 a INF-06 y los ADR técnicos vigentes en una narrativa coherente. No sustituye a los documentos fuente para el detalle exhaustivo:

- El DDL ejecutable completo vive en `teralya_schema_v1.2_EN_REVISION.sql`.
- La descripción campo a campo vive en INF-06.
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
| Infraestructura | Proveedor cloud único, AWS o GCP, con Terraform | Reproducibilidad de entornos |
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

El modelo vigente consta de 17 tablas en PostgreSQL 16:

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
| 10 | `pedido` | Compra global multi-bodega |
| 11 | `pago` | Registro económico de la compra |
| 12 | `subpedido` | Parte del pedido por bodega y fuente logística |
| 13 | `pedido_item` | Línea congelada del pedido |
| 14 | `notificacion` | Comunicación automática |
| 15 | `auditoria` | Registro inmutable de eventos |
| 16 | `incidencia` | Problema operativo básico |
| 17 | `solicitud_recuperacion_password` | Recuperación segura de acceso |

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

---

## 9. Estado de cierre y alcance pendiente

**INF-07 v1.3 queda APROBADO POR EL CTO y sustituye a INF-07 v1.2.**

INF-05 v1.2 e INF-06 v1.1 permanecen EN REVISIÓN hasta su cierre independiente. INF-08 permanece EN REVISIÓN como contrato de API y debe completar la cobertura de las pantallas y casos de uso aprobados. Esa revisión no reabre la topología ni la arquitectura Frontend fijadas en este documento e INF-09.

Quedan fuera del alcance de INF-07 el detalle de endpoints, la implementación de servicios, el código y el sistema de traducción de contenido.

*Documento aprobado. Cualquier cambio transversal exige un nuevo ADR.*
