# Índice Maestro de Documentación — Teralya

**Versión 7.0 · 17 de julio de 2026 · Puerta de entrada a la documentación oficial**

Este índice identifica las fuentes normativas vigentes, el documento actualmente en ejecución y los bloqueos reales. El alcance del MVP permanece congelado.

## CAP — Documentación funcional

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | ✅ APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — | — |
| CAP-02 | Modelo de Datos | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-02_v1.3_Modelo_de_Datos_APROBADO.md | CAP-01, ADR-001, INF-05/06, DLOG 0010/0014–0017 | v1.2 aprobada |
| CAP-03 | Producto del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 | — |
| CAP-04 | Flujos Funcionales | 1.0 | ✅ APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 | — |
| CAP-05 | Pantallas del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-05-Pantallas-del-MVP.pdf | CAP-03, CAP-04 | — |
| CAP-06 | Casos de Uso | 1.0 | ✅ APROBADO | docs/CAP/CAP-06-Casos-de-Uso.pdf | CAP-03, CAP-04, CAP-05 | — |
| CAP-07 | Historias de Usuario | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-07_v1.3_Historias_de_Usuario_APROBADO.md | CAP-06, ADR-001, DLOG 0010/0014–0019 | v1.2 aprobada |
| CAP-08 | Criterios de Aceptación | 1.4 | ✅ APROBADO POR CTO | docs/CAP/CAP-08_v1.4_Criterios_de_Aceptacion_APROBADO.md | CAP-02, CAP-07, INF-08, DLOG 0010/0014–0020 | v1.3 aprobada |
| CAP-09 | Cierre funcional de la web del MVP | 1.0 | ✅ APROBADO POR CTO CON AUTORIZACIÓN CEO | docs/CAP/CAP-09_v1.0_Cierre_Funcional_Web_APROBADO.md | CAP-02/04/06/07/08, LEGAL-07/09, DLOG 0027–0029 | Extensión de cierre, sin ampliar MVP |

## INF — Documentación técnica

| Código | Nombre | Versión | Estado | Ubicación | Dependencias | Sustituye a |
|---|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.5 | ✅ APROBADO POR CTO | docs/INF/teralya_schema_v1.5_APROBADO.sql | CAP-09, ADR-001, DLOG 0014–0017/0027–0028 | v1.4 aprobada |
| INF-06 | Diccionario de Datos | 1.3 | ✅ APROBADO POR CTO | docs/INF/INF-06_v1.3_Diccionario_de_Datos_APROBADO.md | INF-05 hasta v1.4, DLOG 0017 | v1.2 aprobada |
| INF-06-B | Addendum de cierre web | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-06-B_v1.0_Addendum_Cierre_Web_APROBADO.md | INF-05 v1.5, INF-06 v1.3, DLOG 0027–0028 | — |
| INF-07 | Arquitectura Técnica Consolidada | 1.5 | ✅ APROBADO POR CTO Y CEO | docs/INF/INF-07_v1.5_Arquitectura_Tecnica_Consolidada.md | INF-05 v1.5, INF-06/06-B, ADR-002/003/004/006 | v1.4 |
| INF-08 | Especificación de APIs | 2.6 | ✅ APROBADO POR CTO | docs/INF/INF-08_v2.6_Especificacion_de_APIs.md | CAP-09, INF-05 v1.5, INF-06-B, ADR-001/002, DLOG 0027–0028 | v2.5 aprobada |
| INF-08-AUD-IDEM | Auditoría limitada de Idempotencia | 1.0 | ✅ CERRADA | docs/INF/INF-08_v2.1_Auditoria_Limitada_Idempotencia.md | INF-08 v2.1 | Incorporada en v2.2 |
| INF-08-AUD-COV | Auditoría de cobertura de Pantallas y Casos de Uso | 1.0 | ✅ CERRADA | docs/INF/INF-08_v2.1_Auditoria_Cobertura_Pantallas_v1.0.md | CAP-05/06/07, INF-08 v2.1 | 13 brechas cerradas en v2.2 |
| INF-09 | Arquitectura Frontend | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-09_v1.1_Arquitectura_Frontend_APROBADO.md | CAP-05/06/09, INF-05 a INF-08, INF-07 v1.5, ADR-001 a ADR-004 | v1.0 |
| INF-10 | Contrato Técnico de APIs | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-10_v1.1_Contrato_Tecnico_APIs_APROBADO.md | INF-05 v1.5, INF-06-B, INF-08 v2.6, INF-10-A v1.1 | v1.0 |
| INF-10-A | Catálogo Normativo de DTO | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-10-A_v1.1_Catalogo_Normativo_DTO_APROBADO.md | INF-10 v1.1, INF-08 v2.6, DLOG 0027–0028 | v1.0 |
| OPENAPI | Contrato OpenAPI 3.1 | 1.1 | ✅ APROBADO POR CTO | docs/INF/openapi/teralya-openapi-v1.1.yaml | INF-08 v2.6, INF-10/10-A v1.1 | v1.0 |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| DLOG | Decision Log — Teralya | 2.3 | ✅ OFICIAL, incluye 0001–0029 | docs/DECISION_LOG/Decision_Log.md | CAP-09, INF-05 v1.5, INF-08 v2.6, INF-10 v1.1, ADR-001 a ADR-006 |

### Decisiones de negocio vigentes

- Comisión estándar: **15%**. Las excepciones temporales requieren aprobación del CEO.
- Fecha objetivo de lanzamiento del MVP: **octubre de 2026**.
- Teralya no compra ni vende vino; el contrato se celebra entre Comprador y Bodega.
- Fuente normativa: DLOG 0008, 0009, 0025 y 0027–0029.

## ADR

| Código | Nombre | Estado | Ubicación | Decide |
|---|---|---|---|---|
| ADR-001 | Carrito de visitante | ✅ Aceptado | docs/ADR/ADR-001-Carrito-de-visitante.md | CEO, DLOG 0010 |
| ADR-002 | Proveedor de identidad | ✅ Aceptado | docs/ADR/ADR-002-Proveedor-de-identidad.md | CEO, DLOG 0011 |
| ADR-003 | Next.js App Router | ✅ Aceptado | docs/ADR/ADR-003-Nextjs-App-Router.md | CTO, DLOG 0012 |
| ADR-004 | Topología del Frontend del MVP | ✅ Aceptado | docs/ADR/ADR-004-Topologia-Frontend-MVP.md | CTO con autorización CEO, DLOG 0013 |
| ADR-005 | AWS y Terraform | ⚪ Sustituido por ADR-006 | docs/ADR/ADR-005-AWS-Terraform.md | Decisión histórica 0023 |
| ADR-006 | Hetzner, Cloudflare y R2 | ✅ Aceptado | docs/ADR/ADR-006-Hetzner-Cloudflare-R2.md | CEO con recomendación CTO, DLOG 0026 |

## LEGAL

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| LEGAL-01 | Marco Legal y Fiscal para la Venta de Vino en la UE | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-01_Marco_Legal_Fiscal_UE.md | DLOG 0024–0025 |
| LEGAL-02 | Ayudas y Subvenciones | 1.0 | 🟡 BORRADOR | docs/LEGAL/LEGAL-02_Ayudas_y_Subvenciones.md | — |
| LEGAL-03 | Términos y Condiciones de Uso | 1.1 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-03_Terminos_y_Condiciones.md | CAP-02, DLOG 0024–0025 |
| LEGAL-04 | Política de Privacidad (RGPD) | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-04_Politica_de_Privacidad_RGPD.md | INF-05/06, DLOG 0024 |
| LEGAL-05 | Política de Cookies | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-05_Politica_de_Cookies.md | DLOG 0024 |
| LEGAL-06 | Aviso de Mayoría de Edad y Condiciones de Alcohol | 1.0 (`LEGAL-06-v1.0`) | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-06_Aviso_Mayoria_Edad_y_Condiciones_Alcohol.md | LEGAL-01, DLOG 0006/0024 |
| LEGAL-07 | Derecho de Desistimiento y Cancelación de Contrato | 1.1 | ✅ APROBADO; IMPLEMENTACIÓN TÉCNICA CERRADA | docs/LEGAL/LEGAL-07_Derecho_de_Desistimiento_y_Cancelacion.md | CAP-09, INF-08 v2.6, DLOG 0027 |
| LEGAL-08 | Política de Reembolsos e Incidencias | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-08_Politica_de_Reembolsos_e_Incidencias.md | LEGAL-07, DLOG 0015/0024 |
| LEGAL-09 | Plantilla de Condiciones de Envío por Bodega | 1.2 | ✅ APROBADO; IMPLEMENTACIÓN TÉCNICA CERRADA | docs/LEGAL/LEGAL-09_Condiciones_Envio_por_Bodega_Plantilla.md | CAP-09, INF-05 v1.5, DLOG 0025/0028 |

LEGAL-03 a LEGAL-09 están aprobados para la versión actual por el CEO. La implementación no sustituye la revisión jurídica y fiscal externa exigida antes de producción y de operación multi-país a escala.

## UX

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| UX-01 | Cierre UX de la web del MVP | 1.0 | ✅ APROBADO POR CTO | docs/UX/UX-01_v1.0_Cierre_Web_MVP.md | CAP-05/09, INF-09 v1.1 | — |

## OPS

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| OPS-01 | Activación y validación de staging | 1.0 | ▶ EN EJECUCIÓN | docs/OPS/OPS-01_v1.0_Activacion_Staging.md | FE-008, INF-07 v1.5, ADR-006, credenciales externas | Documento actualmente en desarrollo |

## ARCHIVE

| Documento archivado | Motivo |
|---|---|
| `INF-07_v1.0_OBSOLETO_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.1 |
| `docs/INF/INF-07_v1.1_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.2 |
| `docs/INF/INF-07_v1.2_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.3; contenía topología histórica de dos frontends incompatible con ADR-004 |
| `docs/INF/INF-07_v1.3_Arquitectura_Tecnica_Consolidada.md` | Reemplazado por INF-07 v1.4 para incorporar ADR-006 |
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
| `docs/INF/teralya_schema_v1.4_APROBADO.sql` | Sustituido por INF-05 v1.5 aprobada |
| `docs/INF/INF-07_v1.4_Arquitectura_Tecnica_Consolidada.md` | Sustituido por INF-07 v1.5 |
| `docs/INF/INF-08_v2.5_Especificacion_de_APIs.md` | Sustituido por INF-08 v2.6 |
| `docs/INF/INF-09_v1.0_Arquitectura_Frontend_EN_REVISION.md` | Sustituido por INF-09 v1.1 aprobada |
| `docs/INF/INF-10_v1.0_Contrato_Tecnico_APIs_APROBADO.md` | Sustituido por INF-10 v1.1 |
| `docs/INF/INF-10-A_v1.0_Catalogo_Normativo_DTO_APROBADO.md` | Sustituido por INF-10-A v1.1 |
| `docs/INF/openapi/teralya-openapi-v1.0.yaml` | Sustituido por OpenAPI v1.1 |

## Estado operativo y siguiente paso

### Cerrado en construcción

- Backend contract-first completo: API-001 a API-051.
- Frontend único completo para público, acceso, Comprador, Bodega, Administrador y sistema.
- Cancelación contractual directa integrada en PT-COM-007 con ledger, reembolso idempotente, bloqueo logístico y restitución única de stock.
- Condiciones de envío editables en PT-BOD-002 y publicadas en PT-PUB-003/PT-PUB-004.
- Base de datos PostgreSQL v1.5: 20 tablas y migración incremental idempotente.
- OpenAPI 3.1 v1.1: 51 operaciones, 42 paths, 11 módulos y 76 schemas.
- Código, Compose, Caddy, imágenes GHCR, migración y workflows preparados para staging.
- FE-001 a FE-008 quedan cerrados en código. El alcance del MVP no se amplía.

### Documento actualmente en desarrollo

**OPS-01 — Activación y validación de staging.** La construcción web ha terminado; el trabajo activo es convertirla en un entorno operativo con credenciales reales y evidencias de funcionamiento.

### Siguiente paso obligatorio

Cargar secretos en el environment `staging`, reconciliar Hetzner/Cloudflare/R2, configurar SMTP y Stripe de pruebas, activar `STAGING_DEPLOY_ENABLED` y ejecutar la batería E2E, rendimiento, seguridad y restauración descrita en OPS-01.

### Orden de ejecución

1. ✅ FE-001 — workspace Next.js, calidad, variables y cliente HTTP.
2. ✅ FE-002 — layout público responsive, estados y accesibilidad base.
3. ✅ FE-003 — catálogo y ficha de vino.
4. ✅ FE-004 — registro, login y recuperación.
5. ✅ FE-005 — carrito y fusión idempotente.
6. ✅ FE-006 — direcciones, checkout, Stripe y confirmación.
7. ✅ FE-007 — áreas privadas de Comprador, Bodega y Administrador.
8. ✅ FE-008 — seguridad, E2E base, salud, capturas, infraestructura reproducible, cancelación y cierre funcional.
9. ▶ OPS-01 — activación real de staging y gates de salida.

### Bloqueos abiertos

- **Infraestructura y secretos:** environment `staging`, SSH Hetzner, firewall Cloudflare-only, DNS/TLS, R2 UE, SMTP, Stripe test y URLs públicas.
- **Seguridad:** aprobación de límites y ventanas de autenticación y recuperación.
- **Operación:** política ante cobro confirmado sin stock, ensayo de backup/restauración y monitorización.
- **Validación:** E2E real sobre staging, rendimiento, seguridad y accesibilidad final.
- **Legal/fiscal externo:** confirmar antes de producción y de ventas multi-país a escala que el modelo no genera obligaciones adicionales para Teralya, incluido el riesgo de deemed supplier.
- Producción permanece bloqueada hasta cerrar OPS-01. No se usarán valores ficticios para arrancar el backend.

### Regla de continuidad

CAP manda sobre INF. Cualquier cambio de framework, App Router o topología exige un ADR; cualquier cambio económico, de fusión de carrito, pago, cancelación o matriz logística exige una decisión registrada. Ninguna mejora posterior amplía el MVP sin aprobación expresa del CEO.
