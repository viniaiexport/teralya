# Índice Maestro de Documentación — Teralya

**Versión 6.3 · Julio 2026 · Puerta de entrada a la documentación oficial**

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
| INF-10 | Contrato Técnico de APIs | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_APROBADO.md | INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, CAP-08 v1.4, INF-10-A v1.0, ADR-001/002, DLOG 0014–0022 | — |
| INF-10-A | Catálogo Normativo de DTO | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-10-A_v1.0_Catalogo_Normativo_DTO_APROBADO.md | INF-10 v1.0, INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, DLOG 0020 | — |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log — Teralya | 2.1 | ✅ OFICIAL, incluye 0001–0025 | docs/DECISION_LOG/Decision_Log.md | INF-05 v1.4, INF-06 v1.3, INF-08 v2.5, INF-10 v1.0, CAP-02 v1.3, CAP-08 v1.4, ADR-001 a ADR-005 |

### Decisiones de negocio vigentes

- Comisión estándar: **15%**. Las excepciones temporales requieren aprobación del CEO.
- Fecha objetivo de lanzamiento del MVP: **octubre de 2026**.
- Fuente normativa: Decisiones 0008 y 0009.

## ADR

| Código | Nombre | Estado | Ubicación | Decide |
|---|---|---|---|---|
| ADR-001 | Carrito de visitante | ✅ Aceptado | docs/ADR/ADR-001-Carrito-de-visitante.md | CEO, Decisión 0010 |
| ADR-002 | Proveedor de identidad | ✅ Aceptado | docs/ADR/ADR-002-Proveedor-de-identidad.md | CEO, Decisión 0011 |
| ADR-003 | Next.js App Router | ✅ Aceptado | docs/ADR/ADR-003-Nextjs-App-Router.md | CTO, Decisión 0012 |
| ADR-004 | Topología del Frontend del MVP | ✅ Aceptado | docs/ADR/ADR-004-Topologia-Frontend-MVP.md | CTO con autorización CEO, Decisión 0013 |
| ADR-005 | Proveedor cloud e infraestructura del MVP | ✅ Aceptado | docs/ADR/ADR-005-AWS-Terraform.md | CTO con autorización CEO, Decisión 0023 |

## LEGAL

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| LEGAL-01 | Marco Legal y Fiscal para la Venta de Vino en la UE | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL — edad mínima fijada (DLOG 0024) | docs/LEGAL/LEGAL-01_Marco_Legal_Fiscal_UE.md | — |
| LEGAL-02 | Ayudas y Subvenciones | 1.0 | 🟡 BORRADOR | docs/LEGAL/LEGAL-02_Ayudas_y_Subvenciones.md | — |
| LEGAL-03 | Términos y Condiciones de Uso | 1.1 | ✅ APROBADO PARA LA VERSIÓN ACTUAL — comprador compra a la bodega, no a Teralya (DLOG 0025) | docs/LEGAL/LEGAL-03_Terminos_y_Condiciones.md | CAP-02, DLOG 0024, DLOG 0025 |
| LEGAL-04 | Política de Privacidad (RGPD) | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-04_Politica_de_Privacidad_RGPD.md | INF-05, INF-06, DLOG 0024 |
| LEGAL-05 | Política de Cookies | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-05_Politica_de_Cookies.md | DLOG 0024 |
| LEGAL-06 | Aviso de Mayoría de Edad y Condiciones de Alcohol | 1.0 (`LEGAL-06-v1.0`) | ✅ APROBADO PARA LA VERSIÓN ACTUAL — fuente de `ALCOHOL_TERMS_VERSION` | docs/LEGAL/LEGAL-06_Aviso_Mayoria_Edad_y_Condiciones_Alcohol.md | LEGAL-01, DLOG 0006, DLOG 0024 |
| LEGAL-07 | Derecho de Desistimiento y Cancelación de Contrato | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL — botón de cancelación pendiente de implementar | docs/LEGAL/LEGAL-07_Derecho_de_Desistimiento_y_Cancelacion.md | LEGAL-03, DLOG 0024 |
| LEGAL-08 | Política de Reembolsos e Incidencias | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-08_Politica_de_Reembolsos_e_Incidencias.md | LEGAL-07, DLOG 0015, DLOG 0024 |
| LEGAL-09 | Plantilla de Condiciones de Envío por Bodega | 1.1 | ✅ APROBADO PARA LA VERSIÓN ACTUAL — lista orientativa de documentación por país (DLOG 0025); campo pendiente en panel de Bodega | docs/LEGAL/LEGAL-09_Condiciones_Envio_por_Bodega_Plantilla.md | LEGAL-01, LEGAL-03, DLOG 0024, DLOG 0025 |

El contenido LEGAL-03 a LEGAL-09 está aprobado para la versión actual por el CEO, que declara actuar como abogado responsable de esta aprobación (DLOG 0024–0025). Teralya no es la vendedora: el contrato se celebra entre comprador y bodega, y cada bodega asume la responsabilidad fiscal y legal de sus destinos. Los documentos permanecen versionados para actualizarse cuando cambien la normativa o el modelo operativo.

## UX

Carpeta creada y sin contenido oficial todavía: `docs/UX/`.

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
| `docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_EN_REVISION.md` | Sustituido por INF-10 v1.0 aprobada junto con OpenAPI 3.1 |

## Estado operativo y siguiente paso

### Cerrado

- Base funcional y contractual aprobada: CAP-01 a CAP-08, INF-05 a INF-10, INF-10-A y ADR-001 a ADR-004.
- OpenAPI 3.1 aprobado: 50 operaciones, 41 paths, 11 módulos y 74 schemas.
- Backend NestJS contract-first completo: API-001 a API-050 implementadas e integradas en main.
- Frontend FE-001 a FE-007 integrados en main: experiencia pública, autenticación, carrito, checkout y áreas privadas completas de comprador, bodega y administrador.
- Cobertura backend cerrada para autenticación, bodegas, catálogo, carrito, checkout, Stripe, pedidos, SubPedidos, administración, direcciones, imágenes e incidencias.
- Último cierre backend: webhook Stripe API-029 integrado mediante el commit 2af9368.
- Validación final: 41 archivos de prueba y 201 pruebas en verde; lint, build, esquema PostgreSQL, OpenAPI y Redocly correctos.
- Stripe Checkout usa REST/fetch inyectable, sin SDK adicional; el webhook usa firma sobre body crudo, ledger idempotente, locks y control anti-oversell.

### Actualmente en desarrollo

No hay APIs backend pendientes dentro del contrato aprobado. FE-001 a FE-007 están cerrados; comienza la estabilización FE-008.

### Siguiente paso propuesto

Ejecutar FE-008: pruebas E2E, rendimiento, seguridad, staging y preparación de lanzamiento, sin ampliar el alcance del MVP.

### Orden de ejecución frontend

1. ✅ FE-001 — workspace Next.js, calidad, variables de entorno y cliente HTTP tipado.
2. ✅ FE-002 — layout público responsive, navegación, estados de carga/error y accesibilidad base.
3. ✅ FE-003 — catálogo y ficha de vino conectados a API-009/API-010.
4. ✅ FE-004 — registro, login y recuperación de contraseña.
5. ✅ FE-005 — carrito de visitante/autenticado y fusión idempotente.
6. ✅ FE-006 — direcciones, checkout, Stripe y confirmación.
7. ✅ FE-007 — áreas privadas de comprador, bodega y administrador.
8. ▶ FE-008 — pruebas E2E, rendimiento, seguridad, staging y preparación de lanzamiento.

### Bloqueos abiertos

- ✅ MINIMUM_PURCHASE_AGE (18) y ALCOHOL_TERMS_VERSION (`LEGAL-06-v1.0`) fijados por decisión del CEO (DLOG 0024); LEGAL-03 a LEGAL-09 aprobados y publicados para la versión actual.
- ✅ Modelo de responsabilidad fiscal/legal por país cerrado (DLOG 0025): Teralya no compra ni vende vino ni actúa como representante fiscal; cada bodega responde del país al que vende y desde el que envía; Teralya solo sugiere documentación orientativa (LEGAL-09 §2.1). Pendiente de asesoría fiscal externa confirmar que esto no genera deemed supplier por aplicación directa de la ley antes de envíos multi-país a gran escala.
- Antes de producción, Seguridad debe aprobar los límites y ventanas de autenticación y recuperación.
- Antes de producción, Infraestructura debe fijar secretos, SMTP, URLs públicas, almacenamiento de objetos y configuración Stripe definitiva.
- El modelo actual no reserva stock antes del cobro; el webhook impide stock negativo y revierte atómicamente, pero la política operativa ante un cobro confirmado sin stock debe cerrarse antes de producción.
- El botón de cancelación de contrato (Directiva (UE) 2023/2673, ya exigible desde el 19/06/2026) está redactado en LEGAL-07 §3 pero no implementado en Checkout/Pedidos; priorizarlo en el próximo ciclo.
- La plantilla de condiciones de envío por bodega (LEGAL-09) no tiene todavía campo en el panel de Bodega ni en el modelo de datos; falta la funcionalidad para que cada bodega la complete.
- UX sigue sin contenido oficial; debe cerrarse durante la construcción frontend, sin ampliar el alcance del MVP.

### Regla de continuidad

El alcance del MVP permanece congelado. CAP manda sobre INF. Cualquier cambio de framework, App Router o topología requiere un nuevo ADR; cualquier cambio económico, de fusión de carrito o matriz logística requiere una decisión registrada.
