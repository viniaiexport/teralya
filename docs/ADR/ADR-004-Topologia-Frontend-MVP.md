# ADR-004 — Topología del Frontend del MVP

**Estado:** Aceptado  
**Fecha:** 12/07/2026  
**Decide:** CTO, con autorización expresa del CEO para cerrar INF-09 en la misma fecha

## Contexto

INF-07 v1.2 conservaba la formulación histórica de dos frontends React, uno para Comprador y otro para Panel Bodega. INF-09 v1.0, ya apoyado por ADR-003, define una única aplicación Next.js con App Router que incluye las áreas pública, acceso, comprador, bodega, administrador y sistema.

Las dos topologías son incompatibles como arquitectura oficial. Mantenerlas simultáneamente produciría estructuras distintas de monorepo, duplicación de autenticación y componentes, varios despliegues Frontend y una ubicación indefinida para el área Administrador.

## Decisión

- El MVP utiliza **una única aplicación Frontend Next.js con App Router**, basada en React + TypeScript.
- La aplicación se organiza en grupos de rutas separados para: público, acceso, comprador, bodega, administrador y sistema.
- Comprador, Bodega y Administrador disponen de layouts y navegación propios dentro de la misma aplicación.
- El MVP tiene **un único despliegue Frontend**.
- La separación de seguridad no depende del número de aplicaciones: la autorización real se valida siempre en el backend por rol, permisos, validación de bodega y propiedad del recurso.
- El repositorio continúa siendo un monorepo con backend y un único Frontend.
- Esta decisión no añade pantallas, funcionalidades ni alcance al MVP aprobado.

## Consecuencias

- INF-07 se actualiza a v1.3 para eliminar la referencia a dos frontends.
- INF-09 queda alineado con INF-07 y puede aprobarse como arquitectura Frontend.
- Se comparte una única implementación de sesión, internacionalización, componentes y cliente de API.
- Se reduce el número de pipelines y despliegues del MVP.
- Una separación futura en varias aplicaciones requerirá un nuevo ADR y una justificación basada en necesidades reales de escala, seguridad u organización, no en anticipación prematura.
