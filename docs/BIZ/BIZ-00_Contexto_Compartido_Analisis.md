# BIZ-00 — Contexto compartido para análisis de negocio y mercado de Teralya

**Versión 1.0 · 28 de julio de 2026 · Estado: CONTEXTO ANALÍTICO, NO NORMATIVO**

## Finalidad

Este documento ofrece un punto de partida común a cualquier asistente de IA que trabaje en viabilidad, competencia, costes, catálogo, marketing o planificación de Teralya. No sustituye al Decision Log, a CAP, INF, LEGAL ni a las decisiones del CEO.

## Lectura obligatoria

1. `docs/INDEX.md` — estado real, documento en desarrollo y bloqueos.
2. `docs/DECISION_LOG/Decision_Log.md` — decisiones vigentes.
3. `docs/CAP/CAP-03-Producto-del-MVP.md` — alcance del producto.
4. `docs/LEGAL/LEGAL-01_Marco_Legal_Fiscal_UE.md` y `docs/LEGAL/LEGAL-02_Ayudas_y_Subvenciones.md` cuando proceda.
5. Resto de `docs/BIZ/` para no repetir análisis existentes.

## Resumen operativo

Teralya es un marketplace europeo de venta directa de vino entre Bodegas y Compradores. Teralya actúa como intermediario tecnológico y de pago y no compra ni vende vino. La comisión estándar vigente debe comprobarse siempre en el Decision Log. A fecha de este documento es del 15 %. El objetivo de lanzamiento vigente es octubre de 2026. La plataforma utiliza Frontend Next.js App Router, Backend NestJS, PostgreSQL, Redis, Stripe Connect y la infraestructura aprobada en ADR-006.

## Metodología

- **Competencia:** partir de Vivino, Vinissimus, Tannico, Naked Wines, Wine.com y otros comparables relevantes, verificando en fuentes actuales cualquier cifra concreta.
- **Finanzas:** ampliar los modelos existentes, documentar supuestos y separar costes fijos, variables y escenarios.
- **Catálogo:** tratar cualquier cifra mínima de bodegas o vinos como hipótesis de planificación hasta disponer de evidencia y aprobación del CEO.
- **Marketing:** separar SEO, GEO, contenidos, redes sociales, captación de Bodegas y captación de Compradores; no presentar benchmarks generales como específicos de Teralya.
- **Trazabilidad:** distinguir siempre hechos verificados, estimaciones, riesgos y decisiones pendientes.

## Gobierno

- El CEO aprueba decisiones de negocio y ampliaciones de alcance.
- El CTO garantiza coherencia técnica y documental durante la fase actual.
- Los agentes analíticos informan y proponen; no aprueban decisiones.
- La futura reorganización de funciones entre FCO, CTO y subagentes deberá documentarse y aprobarse antes de sustituir el gobierno vigente.

## Historial

- 28/07/2026: creado el contexto compartido y el agente persistente `.claude/agents/teralya-analyst.md`.
