# ADR-003 — Next.js con App Router para el Frontend del MVP

**Estado:** Aceptado
**Fecha:** 12/07/2026
**Decide:** CTO

## Contexto

INF-07 v1.2 establece React y TypeScript para el Frontend. INF-09 v1.0 organiza el MVP mediante rutas públicas, acceso, comprador, bodega, administrador y sistema, y necesita layouts, estados de carga y tratamiento de errores por grupo de rutas. El documento asumía Next.js con App Router, pero esta elección no estaba formalizada.

La ausencia de una decisión explícita permitía iniciar el desarrollo con Pages Router u otra estructura incompatible con la arquitectura descrita en INF-09, generando retrabajo temprano y divergencia entre documentación e implementación.

## Decisión

- El Frontend del MVP se implementará con **Next.js y App Router**, manteniendo **React y TypeScript** como tecnologías base.
- Se utilizará una única aplicación Frontend organizada por grupos de rutas para las áreas pública, acceso, comprador, bodega, administrador y sistema.
- App Router será la base para layouts, estados de carga y manejo de errores por grupo de rutas.
- Esta decisión es exclusivamente técnica y no añade pantallas, funcionalidades ni alcance al MVP aprobado.
- No se adopta Pages Router para el MVP.

## Consecuencias

- INF-09 deja de tratar App Router como propuesta pendiente y pasa a referenciar este ADR como decisión vigente.
- La implementación deberá respetar las rutas, roles y pantallas definidos en CAP-05, CAP-06 e INF-09.
- Cualquier cambio futuro de framework o sistema de rutas requerirá un nuevo ADR por su impacto transversal en la arquitectura Frontend.
- Se reduce el riesgo de retrabajo al fijar antes del desarrollo la estructura técnica asumida por INF-09.
