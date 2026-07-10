# Índice Maestro de Documentación — Teralya

**Versión 2.0 · Julio 2026 · Puerta de entrada a la documentación oficial**

## CAP — Documentación funcional (Arquitecto de Producto)

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — | — |
| CAP-02 | Modelo de Datos | 1.0 | APROBADO | docs/CAP/CAP-02-Modelo-de-Datos.pdf | INF-05 (esquema ejecutable) | — |
| CAP-03 | Producto del MVP | 1.0 | APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 | — |
| CAP-04 | Flujos Funcionales | 1.0 | APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 | — |
| CAP-05 | Pantallas del MVP | 1.0 | APROBADO (en Drive; pendiente de mirror en repo) | Google Drive | CAP-03, CAP-04 | — |
| CAP-06 | Casos de Uso | 1.0 | APROBADO (en Drive; pendiente de mirror en repo) | Google Drive | CAP-03, CAP-04, CAP-05 | — |
| CAP-07 | Historias de Usuario | 1.0 | APROBADO | docs/CAP/CAP-07-Historias-de-Usuario.md | CAP-06 | — |
| CAP-08 | Criterios de Aceptación | 1.0 | APROBADO | docs/CAP/CAP-08-Criterios-de-Aceptacion.md | CAP-07 | — |

## INF — Documentación técnica (Claude)

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.1 | APROBADO | docs/INF/teralya_schema_v1.1_APROBADO.sql | CAP-01, CAP-02 | v1.0 (Histórico en Drive) |
| INF-06 | Diccionario de Datos | 1.0 | APROBADO | docs/INF/INF-06_Diccionario_de_Datos.md | INF-05 | — |
| INF-07 | Arquitectura Técnica Consolidada | 1.0 en repo / **1.1 vigente en Drive** | APROBADO | docs/INF/INF-07_v1.0_Arquitectura_Tecnica_Consolidada.md | INF-01 a INF-06 | — |
| INF-08 | Especificación de APIs | 2.0 | APROBADO (auditoría Fase 2 sin cambios) | docs/INF/INF-08_v2.0_Especificacion_de_APIs.md | CAP-05, CAP-06, INF-05, INF-06 | v1.0, v1.1 (Histórico en Drive) |
| INF-08 (auditoría) | Informe de Auditoría Final | 1.0 | APROBADO | docs/INF/INF-08_Informe_de_Auditoria_Final.md | INF-08 v2.0 | — |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log - Teralya | 1.0 | Oficial | docs/DECISION_LOG/Decision_Log.md | Referenciado por INF-07 |

## ADR, LEGAL, UX

Carpetas creadas y listas para recibir documentación (`docs/ADR/`, `docs/LEGAL/`, `docs/UX/`). Sin contenido todavía.

## ARCHIVE

Carpeta creada para futuros documentos obsoletos del repositorio (`docs/ARCHIVE/`). Sin contenido todavía — el histórico actual (schema v1.0, INF-07 v1.0 original, etc.) permanece en la carpeta "99 - Histórico" de Google Drive.

## Pendiente de sincronización (transparencia)

Por límites de esta sesión, dos documentos quedan referenciados pero no mirrorizados en el repositorio todavía:

- **CAP-05 (Pantallas del MVP)** y **CAP-06 (Casos de Uso)** — documentos extensos (36 pantallas / 32 casos de uso); su contenido ya se usó íntegramente para la auditoría de INF-08, pero el archivo en sí no se ha subido a `docs/CAP/` en este commit.
- **INF-07 v1.1** — el repositorio tiene la v1.0; la v1.1 (con las 2 decisiones del CTO del 09/07/2026) está en Drive.

Ambos se sincronizarán en un próximo commit.
