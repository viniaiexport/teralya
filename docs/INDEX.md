# Índice Maestro de Documentación — Teralya

**Versión 7.2 · 28 de julio de 2026 · Puerta de entrada a la documentación oficial**

Este índice identifica las fuentes normativas vigentes, el documento actualmente en ejecución y los bloqueos reales. El alcance del MVP permanece congelado.

## CAP — Documentación funcional

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| CAP-01 | Entidades del Sistema | 1.0 | ✅ APROBADO | docs/CAP/CAP-01-Entidades-del-Sistema.pdf | — |
| CAP-02 | Modelo de Datos | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-02_v1.3_Modelo_de_Datos_APROBADO.md | CAP-01, ADR-001, INF-05/06, DLOG 0010/0014–0017 |
| CAP-03 | Producto del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-03-Producto-del-MVP.md | CAP-01 |
| CAP-04 | Flujos Funcionales | 1.0 | ✅ APROBADO | docs/CAP/CAP-04-Flujos-Funcionales.md | CAP-03 |
| CAP-05 | Pantallas del MVP | 1.0 | ✅ APROBADO | docs/CAP/CAP-05-Pantallas-del-MVP.pdf | CAP-03, CAP-04 |
| CAP-06 | Casos de Uso | 1.0 | ✅ APROBADO | docs/CAP/CAP-06-Casos-de-Uso.pdf | CAP-03, CAP-04, CAP-05 |
| CAP-07 | Historias de Usuario | 1.3 | ✅ APROBADO POR CTO | docs/CAP/CAP-07_v1.3_Historias_de_Usuario_APROBADO.md | CAP-06, ADR-001, DLOG 0010/0014–0019 |
| CAP-08 | Criterios de Aceptación | 1.4 | ✅ APROBADO POR CTO | docs/CAP/CAP-08_v1.4_Criterios_de_Aceptacion_APROBADO.md | CAP-02, CAP-07, INF-08, DLOG 0010/0014–0020 |
| CAP-09 | Cierre funcional de la web del MVP | 1.0 | ✅ APROBADO POR CTO CON AUTORIZACIÓN CEO | docs/CAP/CAP-09_v1.0_Cierre_Funcional_Web_APROBADO.md | CAP-02/04/06/07/08, LEGAL-07/09, DLOG 0027–0029 |

## INF — Documentación técnica

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| INF-05 | Esquema de Base de Datos | 1.5 | ✅ APROBADO POR CTO | docs/INF/teralya_schema_v1.5_APROBADO.sql | CAP-09, ADR-001, DLOG 0014–0017/0027–0028 |
| INF-06 | Diccionario de Datos | 1.3 | ✅ APROBADO POR CTO | docs/INF/INF-06_v1.3_Diccionario_de_Datos_APROBADO.md | INF-05 hasta v1.4, DLOG 0017 |
| INF-06-B | Addendum de cierre web | 1.0 | ✅ APROBADO POR CTO | docs/INF/INF-06-B_v1.0_Addendum_Cierre_Web_APROBADO.md | INF-05 v1.5, INF-06 v1.3, DLOG 0027–0028 |
| INF-06-C | Addendum de pagos, reparto y documentos económicos | 1.0 | ✅ APROBADO POR CEO | docs/INF/INF-06-C_v1.0_Addendum_Pagos_Stripe_Connect_APROBADO.md | INF-05 v1.5, INF-06 v1.3, DLOG 0030 |
| INF-07 | Arquitectura Técnica Consolidada | 1.5 | ✅ APROBADO POR CTO Y CEO | docs/INF/INF-07_v1.5_Arquitectura_Tecnica_Consolidada.md | INF-05 v1.5, INF-06/06-B, ADR-002/003/004/006 |
| INF-08 | Especificación de APIs | 2.6 | ✅ APROBADO POR CTO | docs/INF/INF-08_v2.6_Especificacion_de_APIs.md | CAP-09, INF-05 v1.5, INF-06-B, ADR-001/002, DLOG 0027–0028 |
| INF-08-B | Addendum de APIs de pagos Stripe Connect | 1.0 | ✅ APROBADO POR CEO | docs/INF/INF-08-B_v1.0_Addendum_APIs_Pagos_Connect_APROBADO.md | INF-08 v2.6, INF-06-C, DLOG 0030 |
| INF-09 | Arquitectura Frontend | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-09_v1.1_Arquitectura_Frontend_APROBADO.md | CAP-05/06/09, INF-05 a INF-08, INF-07 v1.5, ADR-001 a ADR-004 |
| INF-10 | Contrato Técnico de APIs | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-10_v1.1_Contrato_Tecnico_APIs_APROBADO.md | INF-05 v1.5, INF-06-B, INF-08 v2.6, INF-10-A v1.1 |
| INF-10-A | Catálogo Normativo de DTO | 1.1 | ✅ APROBADO POR CTO | docs/INF/INF-10-A_v1.1_Catalogo_Normativo_DTO_APROBADO.md | INF-10 v1.1, INF-08 v2.6, DLOG 0027–0028 |
| OPENAPI | Contrato OpenAPI 3.1 | 1.2 | ✅ APROBADO POR CEO | docs/INF/openapi/teralya-openapi-v1.1.yaml | INF-08 v2.6, INF-08-B, INF-10/10-A v1.1, DLOG 0030 |

## DECISION_LOG

| Código | Nombre | Versión | Estado | Ubicación |
|---|---|---|---|---|
| DLOG | Decision Log — Teralya | 2.4 | ✅ OFICIAL, incluye 0001–0030 | docs/DECISION_LOG/Decision_Log.md |

### Decisiones de negocio vigentes

- Comisión estándar: **15%**. Las excepciones temporales requieren aprobación del CEO.
- Fecha objetivo de lanzamiento del MVP: **octubre de 2026**.
- Teralya no compra ni vende vino; el contrato se celebra entre Comprador y Bodega.
- La comisión se aplica al vino neto de descuentos; la Bodega recibe el resto más transporte e impuestos atribuibles.
- Fuente normativa: DLOG 0008, 0009, 0025 y 0027–0030.

## ADR

| Código | Nombre | Estado | Ubicación |
|---|---|---|---|
| ADR-001 | Carrito de visitante | ✅ Aceptado | docs/ADR/ADR-001-Carrito-de-visitante.md |
| ADR-002 | Proveedor de identidad | ✅ Aceptado | docs/ADR/ADR-002-Proveedor-de-identidad.md |
| ADR-003 | Next.js App Router | ✅ Aceptado | docs/ADR/ADR-003-Nextjs-App-Router.md |
| ADR-004 | Topología del Frontend del MVP | ✅ Aceptado | docs/ADR/ADR-004-Topologia-Frontend-MVP.md |
| ADR-005 | AWS y Terraform | ⚪ Sustituido por ADR-006 | docs/ADR/ADR-005-AWS-Terraform.md |
| ADR-006 | Hetzner, Cloudflare y R2 | ✅ Aceptado | docs/ADR/ADR-006-Hetzner-Cloudflare-R2.md |

## LEGAL

| Código | Nombre | Versión | Estado | Ubicación |
|---|---|---|---|---|
| LEGAL-01 | Marco Legal y Fiscal para la Venta de Vino en la UE | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-01_Marco_Legal_Fiscal_UE.md |
| LEGAL-02 | Ayudas y Subvenciones | 1.0 | 🟡 BORRADOR | docs/LEGAL/LEGAL-02_Ayudas_y_Subvenciones.md |
| LEGAL-03 | Términos y Condiciones de Uso | 1.2 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-03_Terminos_y_Condiciones.md |
| LEGAL-04 | Política de Privacidad (RGPD) | 1.1 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-04_Politica_de_Privacidad_RGPD.md |
| LEGAL-05 | Política de Cookies | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-05_Politica_de_Cookies.md |
| LEGAL-06 | Aviso de Mayoría de Edad y Condiciones de Alcohol | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-06_Aviso_Mayoria_Edad_y_Condiciones_Alcohol.md |
| LEGAL-07 | Derecho de Desistimiento y Cancelación de Contrato | 1.1 | ✅ APROBADO; IMPLEMENTACIÓN TÉCNICA CERRADA | docs/LEGAL/LEGAL-07_Derecho_de_Desistimiento_y_Cancelacion.md |
| LEGAL-08 | Política de Reembolsos e Incidencias | 1.0 | ✅ APROBADO PARA LA VERSIÓN ACTUAL | docs/LEGAL/LEGAL-08_Politica_de_Reembolsos_e_Incidencias.md |
| LEGAL-09 | Plantilla de Condiciones de Envío por Bodega | 1.2 | ✅ APROBADO; IMPLEMENTACIÓN TÉCNICA CERRADA | docs/LEGAL/LEGAL-09_Condiciones_Envio_por_Bodega_Plantilla.md |

LEGAL-03 a LEGAL-09 están aprobados para la versión actual por el CEO. La implementación no sustituye la revisión jurídica y fiscal externa exigida antes de producción y de operación multi-país a escala.

## UX

| Código | Nombre | Versión | Estado | Ubicación |
|---|---|---|---|---|
| UX-01 | Cierre UX de la web del MVP | 1.0 | ✅ DISEÑO APROBADO; ACEPTACIÓN MÓVIL OPERATIVA REABIERTA | docs/UX/UX-01_v1.0_Cierre_Web_MVP.md |

La aprobación de UX-01 mantiene vigente la dirección visual y funcional. No equivale a validar el funcionamiento del despliegue en teléfonos físicos.

## OPS

| Código | Nombre | Versión | Estado | Ubicación | Dependencias |
|---|---|---|---|---|---|
| OPS-01 | Activación y validación de staging | 1.2 | ▶ EN EJECUCIÓN, BLOQUEO MÓVIL P0 | docs/OPS/OPS-01_v1.0_Activacion_Staging.md | FE-008, INF-07 v1.5, ADR-006, credenciales externas |

Evidencias operativas vigentes: `docs/OPS/OPS-01_Evidencias_Staging_2026-07-20.md`. El gate específico de pagos está en `docs/OPS/OPS-01_Pagos_Stripe_Connect_2026-07-24.md`.

## Estado operativo real

### Cerrado en construcción

- Backend contract-first completo: API-001 a API-056.
- Frontend único implementado para público, acceso, Comprador, Bodega, Administrador y sistema.
- Cancelación contractual, condiciones de envío, base de datos PostgreSQL v1.5, OpenAPI 3.1 y Stripe Connect implementados en código.
- Código, Compose, Caddy, imágenes GHCR, migración y workflows preparados para staging.
- FE-001 a FE-008 están implementados en código, pero FE-002 y FE-008 no tienen aceptación operativa móvil definitiva.

### Documento actualmente en desarrollo

**OPS-01 — Activación y validación de staging.** El trabajo activo incluye:

1. revalidar la web en teléfonos Android e iPhone reales;
2. validar Stripe Connect y el reparto real con dos Bodegas de prueba;
3. cerrar los gates generales del entorno.

### Contradicción corregida

La documentación anterior declaraba cerrada la experiencia responsive basándose en pruebas automatizadas, perfiles emulados y capturas. El CEO comunicó posteriormente que la web seguía sin funcionar correctamente en un teléfono real. Desde esta versión:

- el código responsive se considera implementado, no aceptado;
- la validación móvil se reabre como bloqueo P0;
- ninguna prueba emulada sustituye la aceptación en dispositivos físicos;
- producción permanece bloqueada hasta registrar evidencia satisfactoria.

### Orden de ejecución

1. ✅ FE-001 — workspace Next.js, calidad, variables y cliente HTTP.
2. ⚠️ FE-002 — layout público responsive implementado; aceptación móvil reabierta.
3. ✅ FE-003 — catálogo y ficha de vino.
4. ✅ FE-004 — registro, login y recuperación.
5. ✅ FE-005 — carrito y fusión idempotente.
6. ✅ FE-006 — direcciones, checkout, Stripe y confirmación.
7. ✅ FE-007 — áreas privadas de Comprador, Bodega y Administrador.
8. ⚠️ FE-008 — cierre técnico implementado; gate móvil pendiente.
9. ▶ OPS-01 — activación real de staging y gates de salida.

### Bloqueos abiertos

- **Móvil P0:** aceptación en Android e iPhone reales de portada, navegación, selector de idioma, catálogo, ficha de vino, acceso, carrito y checkout.
- **Seguridad:** aprobación formal de límites y ventanas de autenticación y recuperación.
- **Operación:** aprobación por el CEO de la política ante cobro confirmado sin stock.
- **Validación:** recorridos de negocio reales con datos y usuarios controlados de staging.
- **Legal/fiscal externo:** confirmar antes de producción y de ventas multi-país a escala que el modelo no genera obligaciones adicionales para Teralya, incluido el riesgo de deemed supplier.
- **Pagos live:** completar onboarding Connect de cada Bodega, aportar datos fiscales verificados y validar el tratamiento de IVA de la comisión antes de emitir facturas reales.
- Producción permanece bloqueada hasta cerrar OPS-01. No se usarán valores ficticios para arrancar el backend.

## Archivo histórico

Los documentos sustituidos y borradores anteriores permanecen en el repositorio únicamente como trazabilidad histórica. No son fuentes normativas cuando existe una versión aprobada posterior identificada en este índice.

## Regla de continuidad

CAP manda sobre INF. Cualquier cambio de framework, App Router o topología exige un ADR; cualquier cambio económico, de fusión de carrito, pago, cancelación o matriz logística exige una decisión registrada. Ninguna mejora posterior amplía el MVP sin aprobación expresa del CEO.