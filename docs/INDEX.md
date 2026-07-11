# Índice Maestro de Documentación — Teralya

**Versión 3.1 · Julio 2026 · Puerta de entrada a la documentación oficial**

## CAP — Documentación funcional (Arquitecto de Producto)

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | ✅ APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — | — |
| CAP-02 | Modelo de Datos | 1.0 | ⚠️ INCOMPLETA — RECONSTRUCCIÓN AUTORIZADA | docs/CAP/CAP-02-Modelo-de-Datos.pdf | INF-05 (esquema ejecutable) | — |
| CAP-03 | Producto del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 | — |
| CAP-04 | Flujos Funcionales | 1.0 | ✅ APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 | — |
| CAP-05 | Pantallas del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-05-Pantallas-del-MVP.pdf | CAP-03, CAP-04 | — |
| CAP-06 | Casos de Uso | 1.0 | ✅ APROBADO | docs/CAP/CAP-06-Casos-de-Uso.pdf | CAP-03, CAP-04, CAP-05 | — |
| CAP-07 | Historias de Usuario | 1.0 | ⚠️ INCOMPLETA — RECONSTRUCCIÓN AUTORIZADA | docs/CAP/CAP-07-Historias-de-Usuario.md | CAP-06 | — |
| CAP-08 | Criterios de Aceptación | 1.0 | ⚠️ INCOMPLETA — RECONSTRUCCIÓN AUTORIZADA | docs/CAP/CAP-08-Criterios-de-Aceptacion.md | CAP-07 | — |

## INF — Documentación técnica (Claude)

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.1 | ✅ APROBADO | docs/INF/teralya_schema_v1.1_APROBADO.sql | CAP-01, CAP-02 | v1.0 (docs/ARCHIVE) |
| INF-06 | Diccionario de Datos | 1.0 | ✅ APROBADO | docs/INF/INF-06_Diccionario_de_Datos.md | INF-05 | — |
| INF-07 | Arquitectura Técnica Consolidada | 1.1 | ✅ APROBADO | docs/INF/INF-07_v1.1_Arquitectura_Tecnica_Consolidada.md | INF-01 a INF-06 | v1.0 (docs/ARCHIVE) |
| INF-08 | Especificación de APIs | 2.1 | 🟡 EN REVISIÓN | docs/INF/INF-08_v2.1_Especificacion_de_APIs.md | CAP-05, CAP-06, INF-05, INF-06 | v2.0 |
| INF-08 (auditoría limitada) | Auditoría de Idempotencia | 1.0 | 🟡 EN REVISIÓN | docs/INF/INF-08_v2.1_Auditoria_Limitada_Idempotencia.md | INF-08 v2.1 | — |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log - Teralya | 1.0 | ✅ Oficial | docs/DECISION_LOG/Decision_Log.md | Referenciado por INF-07 |

## ADR, LEGAL, UX

Carpetas creadas y listas para recibir documentación (`docs/ADR/`, `docs/LEGAL/`, `docs/UX/`). Sin contenido todavía — no hay ningún documento oficial pendiente de mover ahí.

## ARCHIVE

| Documento archivado | Motivo |
|---|---|
| `INF-07_v1.0_OBSOLETO_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.1 (incorpora Decisión CTO de mayoría de edad e internacionalización) |
| `docs/INF/INF-08_v2.0_Especificacion_de_APIs.md` | Versión histórica aprobada; sustituida por v2.1 en revisión con protección de idempotencia |
| `docs/INF/INF-08_Informe_de_Auditoria_Final.md` | Auditoría histórica correspondiente exclusivamente a INF-08 v2.0 |

## Verificación de sincronización — trabajo pendiente

Documentos en reconstrucción o revisión:

- CAP-02 v1.1 — reconstrucción autorizada.
- CAP-07 v1.1 — reconstrucción autorizada.
- CAP-08 v1.1 — reconstrucción autorizada.
- INF-08 v2.1 y auditoría limitada — en revisión.
