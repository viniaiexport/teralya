# Índice Maestro de Documentación — Teralya

**Versión 5.0 · Julio 2026 · Puerta de entrada a la documentación oficial**

## CAP — Documentación funcional

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | ✅ APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — | — |
| CAP-02 | Modelo de Datos | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-02_v1.3_Modelo_de_Datos_APROBADO.md | CAP-01, ADR-001, INF-05 v1.4, INF-06 v1.3, DLOG 0010/0014–0017 | v1.2 aprobada |
| CAP-03 | Producto del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 | — |
| CAP-04 | Flujos Funcionales | 1.0 | ✅ APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 | — |
| CAP-05 | Pantallas del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-05-Pantallas-del-MVP.pdf | CAP-03, CAP-04 | — |
| CAP-06 | Casos de Uso | 1.0 | ✅ APROBADO | docs/CAP/CAP-06-Casos-de-Uso.pdf | CAP-03, CAP-04, CAP-05 | — |
| CAP-07 | Historias de Usuario | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-07_v1.3_Historias_de_Usuario_APROBADO.md | CAP-06, ADR-001, DLOG 0010/0014–0019 | v1.2 aprobada |
| CAP-08 | Criterios de Aceptación | 1.4 | ✅ APROBADO POR CTO | docs/CAP/CAP-08_v1.4_Criterios_de_Aceptacion_APROBADO.md | CAP-02 v1.3, CAP-07 v1.3, INF-08 v2.5, ADR-001, DLOG 0010/0014–0020 | v1.3 aprobada |

## INF — Documentación técnica

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.4 | ✅ APROBADO POR CTO | docs/INF/teralya_schema_v1.4_APROBADO.sql | CAP-01, ADR-001, DLOG 0014–0017 | v1.3 aprobada |
| INF-06 | Diccionario de Datos | 1.3 | ✅ APROBADO POR CTO | docs/INF/INF-06_v1.3_Diccionario_de_Datos_APROBADO.md | INF-05 v1.4, DLOG 0017 | v1.2 aprobada |
| INF-07 | Arquitectura Técnica Consolidada | 1.3 | ✅ APROBADO POR CTO | docs/INF/INF-07_v1.3_Arquitectura_Tecnica_Consolidada.md | INF-05, INF-06, ADR-002, ADR-003, ADR-004 | v1.2 |
| INF-08 | Especificación de APIs | 2.5 | ✅ APROBADO POR CTO | docs/INF/INF-08_v2.5_Especificacion_de_APIs.md | CAP-02 v1.3, CAP-05, CAP-06, CAP-07 v1.3, INF-05 v1.4, INF-06 v1.3, ADR-001/002, DLOG 0014–0020 | v2.4 aprobada |
| INF-08-AUD-IDEM | Auditoría limitada de Idempotencia | 1.0 | ✅ Cerrada (incorporada en v2.2) | docs/INF/INF-08_v2.1_Auditoria_Limitada_Idempotencia.md | INF-08 v2.1 | — |
| INF-08-AUD-COV | Auditoría de cobertura de Pantallas y Casos de Uso | 1.0 | ✅ Cerrada (13 brechas resueltas en v2.2) | docs/INF/INF-08_v2.1_Auditoria_Cobertura_Pantallas_v1.0.md | CAP-05, CAP-06, CAP-07, INF-08 v2.1 | — |
| INF-09 | Arquitectura Frontend | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-09_v1.0_Arquitectura_Frontend_EN_REVISION.md | CAP-05, CAP-06, INF-05 a INF-08, INF-07 v1.3, ADR-001 a ADR-004 | — |
| INF-10 | Contrato Técnico de APIs | 1.0 | 🟡 EN REVISIÓN | docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_EN_REVISION.md | INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, CAP-08 v1.4, ADR-001/002, DLOG 0014–0020 | — |
| INF-10-A | Catálogo Normativo de DTO | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-10-A_v1.0_Catalogo_Normativo_DTO_APROBADO.md | INF-10 v1.0, INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, DLOG 0020 | — |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log — Teralya | 1.6 | ✅ OFICIAL, incluye 0001–0020 | docs/DECISION_LOG/Decision_Log.md | INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, CAP-02 v1.3, CAP-08 v1.4, ADR-001 a ADR-004 |

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
| `docs/INF/teralya_schema_v1.3_EN_REVISION.sql` | Sustituido por INF-05 v1.3 aprobada |
| `docs/INF/INF-06_Diccionario_de_Datos.md` | Sustituido por INF-06 v1.1 en revisión |
| `docs/INF/INF-06_v1.1_Diccionario_de_Datos.md` | Sustituido por INF-06 v1.2 aprobada |
| `docs/INF/INF-06_v1.2_Diccionario_de_Datos_EN_REVISION.md` | Sustituido por INF-06 v1.2 aprobada |
| `docs/CAP/CAP-02-Modelo-de-Datos.pdf` | Sustituido por CAP-02 v1.1 |
| `docs/CAP/CAP-02_v1.1_Modelo_de_Datos.md` | Sustituido por CAP-02 v1.2 aprobada |
| `docs/CAP/CAP-02_v1.2_Modelo_de_Datos_EN_REVISION.md` | Sustituido por CAP-02 v1.2 aprobada |
| `docs/CAP/CAP-07-Historias-de-Usuario.md` | Sustituido por CAP-07 v1.1 |
| `docs/CAP/CAP-07_v1.1_Historias_de_Usuario.md` | Sustituido por CAP-07 v1.2 aprobada |
| `docs/CAP/CAP-07_v1.2_Historias_de_Usuario_EN_REVISION.md` | Sustituido por CAP-07 v1.2 aprobada |
| `docs/CAP/CAP-08-Criterios-de-Aceptacion.md` | Sustituido por CAP-08 v1.1 |
| `docs/INF/INF-08_v2.0_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.1 |
| `docs/INF/INF-08_v2.1_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.2 (cierra 13 brechas de cobertura) |
| `docs/INF/INF-08_Informe_de_Auditoria_Final.md` | Auditoría histórica de INF-08 v2.0 |
| `docs/INF/teralya_schema_v1.3_APROBADO.sql` | Sustituido por INF-05 v1.4 aprobada |
| `docs/INF/teralya_schema_v1.4_EN_REVISION.sql` | Sustituido por INF-05 v1.4 aprobada |
| `docs/INF/INF-06_v1.2_Diccionario_de_Datos_APROBADO.md` | Sustituido por INF-06 v1.3 aprobada |
| `docs/INF/INF-06_v1.3_Diccionario_de_Datos_EN_REVISION.md` | Sustituido por INF-06 v1.3 aprobada |
| `docs/CAP/CAP-02_v1.2_Modelo_de_Datos_APROBADO.md` | Sustituido por CAP-02 v1.3 aprobada |
| `docs/CAP/CAP-02_v1.3_Modelo_de_Datos_EN_REVISION.md` | Sustituido por CAP-02 v1.3 aprobada |
| `docs/INF/INF-08_v2.2_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.3 aprobada |
| `docs/INF/INF-08_v2.3_Especificacion_de_APIs_EN_REVISION.md` | Sustituido por INF-08 v2.3 aprobada |
| `docs/CAP/CAP-08_v1.1_Criterios_de_Aceptacion.md` | Sustituido por CAP-08 v1.2 aprobada |
| `docs/CAP/CAP-08_v1.2_Criterios_de_Aceptacion_EN_REVISION.md` | Sustituido por CAP-08 v1.2 aprobada |
| `docs/CAP/CAP-07_v1.3_Historias_de_Usuario_EN_REVISION.md` | Sustituido por CAP-07 v1.3 aprobada |
| `docs/CAP/CAP-08_v1.3_Criterios_de_Aceptacion_EN_REVISION.md` | Sustituido por CAP-08 v1.3 aprobada |
| `docs/INF/INF-08_v2.4_Especificacion_de_APIs_EN_REVISION.md` | Sustituido por INF-08 v2.4 aprobada |
| `docs/CAP/CAP-08_v1.4_Criterios_de_Aceptacion_EN_REVISION.md` | Sustituido por CAP-08 v1.4 aprobada |
| `docs/INF/INF-08_v2.5_Especificacion_de_APIs_EN_REVISION.md` | Sustituido por INF-08 v2.5 aprobada |
| `docs/INF/INF-10-A_v1.0_Catalogo_Normativo_DTO_EN_REVISION.md` | Sustituido por INF-10-A v1.0 aprobada |

## Estado operativo y siguiente documento

### Cerrado hoy

- INF-05 v1.4 aprobado con 19 tablas, 19 ENUM, 46 constraints, 44 índices, 14 funciones y 30 triggers.
- INF-06 v1.3 aprobado y alineado 1:1 con INF-05 v1.4.
- CAP-02 v1.3 aprobado con `carrito_fusion` como soporte técnico persistente de DLOG 0017.
- INF-08 v2.5 aprobado con 50 rutas/11 módulos y precisiones de API-017/023/029; ningún código, método o ruta cambió.
- CAP-07 v1.3 y CAP-08 v1.4 aprobados con 32 historias y 103 criterios.
- INF-10-A v1.0 aprobado con schemas cerrados y mapeo API-001→050.
- DLOG v1.6 oficial con Decisiones 0001–0020; TAPI-01→09 quedan cerradas y aprobadas.
- La fusión del carrito suma cantidades hasta stock, usa `fusion_id`, SHA-256 canónico, FK Comprador–Carrito y bloqueo transaccional.
- La matriz logística de DLOG 0018 deriva `pedido.estado` desde `subpedido.estado`.
- Las 13 brechas históricas de cobertura de INF-08 permanecen cerradas.
- INF-07, INF-09 y ADR-001 a ADR-004 no se reabren.

### Documento actualmente en desarrollo

**INF-10 v1.0** — matriz 50/50 y TAPI-01→09 cerradas; INF-10-A aprobado. Único artefacto pendiente: generar y validar OpenAPI 3.1.

### Siguiente paso propuesto

Generar `docs/INF/openapi/teralya-openapi-v1.0_EN_REVISION.yaml`, validar sintaxis, `$ref`, cobertura 50/50, ejemplos y seguridad, y someter INF-10 + YAML a aprobación final.

### Bloqueos abiertos

- TAPI-01→09 están resueltas por DLOG 0019/0020.
- No quedan bloqueos TAPI ni funcionales en CAP-08 v1.4, INF-08 v2.5 o INF-10-A v1.0.
- INF-10 no puede aprobarse hasta generar y validar el OpenAPI 3.1.
- Los documentos previamente aprobados CAP-02, CAP-07 v1.2, CAP-08 v1.2, INF-05, INF-06, INF-08 v2.3 y la arquitectura Frontend no se reabren.
- LEGAL y UX siguen sin contenido oficial; su planificación requiere una instrucción independiente.

### Regla de continuidad

La revisión de INF-08 v2.4 no reabre INF-09. Cualquier cambio futuro de framework, App Router o topología requiere un nuevo ADR. Cualquier cambio de fórmula de fusión o matriz logística requiere una nueva decisión registrada.
