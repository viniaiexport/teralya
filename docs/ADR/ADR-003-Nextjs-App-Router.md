# ADR-003 — Next.js App Router

**Estado:** Aceptado
**Fecha:** Julio 2026
**Decide:** CTO

## Contexto

INF-07 (v1.2) aprueba React + TypeScript como stack de Frontend, sin fijar un meta-framework ni un modo de enrutado concreto. Al crear INF-09 (Arquitectura Frontend) se asumió Next.js con App Router como base de diseño de rutas, layouts, estados de carga y manejo de errores por grupo de rutas, pero quedó registrado como "ADR propuesto", sin decisión formal — un punto pendiente que debía cerrarse antes de iniciar la implementación.

## Decisión

- El Frontend del MVP se construye con **Next.js**.
- Se utiliza exclusivamente **App Router**.
- **No se utiliza Pages Router.**
- Se mantiene React + TypeScript (INF-07 §2), sin ampliar funcionalidades ni cambiar el stack ya aprobado.

## Consecuencias

- La arquitectura de rutas, layouts, estados de carga (`loading`) y manejo de errores (`error boundaries`) de INF-09 (§3, §5, §6, §12, §13) se confirma sobre App Router, sin necesidad de rediseño.
- INF-09 sustituye la referencia a "ADR-003 propuesto" por la referencia a este ADR, ya aceptado.
- No se requiere ningún cambio en INF-05, INF-06, INF-07 ni INF-08 como consecuencia de este ADR.
