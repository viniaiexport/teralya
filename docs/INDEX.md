# Índice Maestro de Documentación — Teralya

**Versión 3.9 · Julio 2026 · Puerta de entrada a la documentación oficial**

## CAP — Documentación funcional

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | ✅ APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — | — |
| CAP-02 | Modelo de Datos | 1.1 | 🟡 EN REVISIÓN | docs/CAP/CAP-02_v1.1_Modelo_de_Datos.md | CAP-01, INF-05 v1.2, INF-06 v1.1 | v1.0 incompleta |
| CAP-03 | Producto del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 | — |
| CAP-04 | Flujos Funcionales | 1.0 | ✅ APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 | — |
| CAP-05 | Pantallas del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-05-Pantallas-del-MVP.pdf | CAP-03, CAP-04 | — |
| CAP-06 | Casos de Uso | 1.0 | ✅ APROBADO | docs/CAP/CAP-06-Casos-de-Uso.pdf | CAP-03, CAP-04, CAP-05 | — |
| CAP-07 | Historias de Usuario | 1.1 | 🟡 EN REVISIÓN | docs/CAP/CAP-07_v1.1_Historias_de_Usuario.md | CAP-06 | v1.0 incompleta |
| CAP-08 | Criterios de Aceptación | 1.1 | 🟡 EN REVISIÓN | docs/CAP/CAP-08_v1.1_Criterios_de_Aceptacion.md | CAP-07 v1.1 | v1.0 incompleta |

## INF — Documentación técnica

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.3 | 🟡 EN REVISIÓN | docs/INF/teralya_schema_v1.3_EN_REVISION.sql | CAP-01, CAP-02, INF-08 v2.2, DLOG 0014–0016 | v1.2 en revisión |
| INF-06 | Diccionario de Datos | 1.1 | 🟡 EN REVISIÓN | docs/INF/INF-06_v1.1_Diccionario_de_Datos.md | INF-05 v1.2 | v1.0 aprobada |
| INF-07 | Arquitectura Técnica Consolidada | 1.3 | ✅ APROBADO POR CTO | docs/INF/INF-07_v1.3_Arquitectura_Tecnica_Consolidada.md | INF-05, INF-06, ADR-002, ADR-003, ADR-004 | v1.2 |
| INF-08 | Especificación de APIs | 2.2 | ✅ APROBADO POR CTO | docs/INF/INF-08_v2.2_Especificacion_de_APIs.md | CAP-05, CAP-06, CAP-07, INF-05, INF-06, ADR-002 | v2.1 |
| INF-08-AUD-IDEM | Auditoría limitada de Idempotencia | 1.0 | ✅ Cerrada (incorporada en v2.2) | docs/INF/INF-08_v2.1_Auditoria_Limitada_Idempotencia.md | INF-08 v2.1 | — |
| INF-08-AUD-COV | Auditoría de cobertura de Pantallas y Casos de Uso | 1.0 | ✅ Cerrada (13 brechas resueltas en v2.2) | docs/INF/INF-08_v2.1_Auditoria_Cobertura_Pantallas_v1.0.md | CAP-05, CAP-06, CAP-07, INF-08 v2.1 | — |
| INF-09 | Arquitectura Frontend | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-09_v1.0_Arquitectura_Frontend_EN_REVISION.md | CAP-05, CAP-06, INF-05 a INF-08, INF-07 v1.3, ADR-001 a ADR-004 | — |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log — Teralya | 1.3 | ✅ OFICIAL, incluye 0001–0016 | docs/DECISION_LOG/Decision_Log.md | INF-07, INF-09, ADR-001 a ADR-004 |

### Decisiones de negocio vigentes

- Comisión objetivo estándar: **10%**. Las reducciones temporales requieren aprobación del CEO.
- Fecha objetivo de lanzamiento del MVP: **octubre de 2026**.
- Fuente normativa: Decisiones 0008 y 0009.

## ADR

| Código | Nombre | Estado | Ubicación | Decide |
|---|---|---|---|---|
| ADR-001 | Carrito de visitante | ✅ Aceptado | docs/ADR/ADR-001-Carrito-de-visitante.md | CEO, Decisión 0010 |
| ADR-002 | Proveedor de identidad | ✅ Aceptado | docs/ADR/ADR-002-Proveedor-de-identidad.md | CEO, Decisión 0011 |
| ADR-003 | Next.js App Router | ✅ Aceptado | docs/ADR/ADR-003-Nextjs-App-Router.md | CTO, Decisión 0012 |
| ADR-004 | Topología del Frontend del MVP | ✅ Aceptado | docs/ADR/ADR-004-Topologia-Frontend-MVP.md | CTO con autorización CEO, Decisión 0013 |

## LEGAL, UX

Carpetas creadas y sin contenido oficial todavía: `docs/LEGAL/` y `docs/UX/`.

## ARCHIVE

| Documento archivado | Motivo |
|---|---|
| `INF-07_v1.0_OBSOLETO_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.1 |
| `docs/INF/INF-07_v1.1_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.2 |
| `docs/INF/INF-07_v1.2_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.3; contenía topología histórica de dos frontends incompatible con ADR-004 |
| `docs/INF/teralya_schema_v1.1_APROBADO.sql` | Sustituido por INF-05 v1.2 en revisión |
| `docs/INF/teralya_schema_v1.2_EN_REVISION.sql` | Sustituido por INF-05 v1.3 en revisión |
| `docs/INF/INF-06_Diccionario_de_Datos.md` | Sustituido por INF-06 v1.1 en revisión |
| `docs/CAP/CAP-02-Modelo-de-Datos.pdf` | Sustituido por CAP-02 v1.1 |
| `docs/CAP/CAP-07-Historias-de-Usuario.md` | Sustituido por CAP-07 v1.1 |
| `docs/CAP/CAP-08-Criterios-de-Aceptacion.md` | Sustituido por CAP-08 v1.1 |
| `docs/INF/INF-08_v2.0_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.1 |
| `docs/INF/INF-08_v2.1_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.2 (cierra 13 brechas de cobertura) |
| `docs/INF/INF-08_Informe_de_Auditoria_Final.md` | Auditoría histórica de INF-08 v2.0 |

## Estado operativo y siguiente documento

### Cerrado hoy

- INF-07 v1.3 aprobado y alineado con una única aplicación Next.js.
- INF-09 v1.0 aprobado con 25 apartados.
- ADR-004 y Decisión 0013 cierran la topología Frontend.
- INF-08 v2.2 aprobado con 42 endpoints en 9 módulos.
- Las 13 brechas de cobertura de INF-08 v2.1 quedan cerradas.
- La trazabilidad de CU-001 a CU-032 y de las 36 pantallas queda documentada; CU-031 y CU-032 son reglas transversales del contrato.
- INF-09 §19 actualizado para referenciar INF-08 v2.2 aprobada.
- INF-05 v1.3 creado con decisiones 0014–0016, 18 tablas e integridad reforzada.

### Documento actualmente en desarrollo

**INF-05 v1.3 — Esquema de Base de Datos** — creado y pendiente de auditoría final del CTO.

### Bloqueos abiertos

- INF-05 v1.3 sigue EN REVISIÓN hasta superar auditoría final; INF-06 v1.1 debe actualizarse después a la nueva estructura.
- No debe iniciarse persistencia ni migraciones definitivas hasta aprobar INF-05 v1.3.
- CAP-02 v1.1 sigue EN REVISIÓN y debe cerrarse de forma coherente con INF-05 e INF-06.
- CAP-07 v1.1 y CAP-08 v1.1 siguen EN REVISIÓN y requieren cierre funcional independiente.
- No quedan bloqueos abiertos de cobertura en INF-08 ni de arquitectura Frontend.

### Regla de continuidad

La aprobación de INF-08 v2.2 no reabre INF-09. Cualquier cambio futuro de framework, App Router o topología requiere un nuevo ADR.
