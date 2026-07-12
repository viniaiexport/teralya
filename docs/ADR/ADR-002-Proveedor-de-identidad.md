# ADR-002 — Proveedor de identidad del MVP

**Estado:** Aceptado
**Fecha:** Julio 2026
**Decide:** CEO

## Contexto

Durante el desarrollo de INF-09 se identificó que la documentación no fijaba explícitamente si la autenticación del MVP se gestiona con un proveedor de identidad externo (p. ej. un servicio de autenticación gestionado) o de forma autogestionada por el backend de Teralya. INF-05 v1.2 e INF-07 v1.2 ya asumían de forma coherente entre sí un modelo autogestionado (`usuario.password_hash`, hashing bcrypt/argon2), pero nunca se había fijado como decisión formal, dejando abierta la posibilidad de una futura migración no planificada que volviera a mover esquema, API y frontend a la vez.

## Decisión

- Para el MVP, la autenticación **se mantiene gestionada por el backend de Teralya**, conforme al modelo vigente de `usuario.password_hash`.
- **No se adopta**, para esta fase, un proveedor externo de identidad gestionado.
- La recuperación de contraseña se apoya en la entidad `solicitud_recuperacion_password` (INF-05 v1.2), no en tokens almacenados directamente en `usuario`.

## Consecuencias

- INF-09 (Arquitectura Frontend) diseña la integración de sesión asumiendo un backend propio como única fuente de autenticación, sin cliente de un proveedor externo.
- Cualquier adopción futura de un proveedor de identidad gestionado requiere un nuevo ADR antes de implementarse, dado el impacto simultáneo en INF-05 (esquema), INF-08 (contrato de API) e INF-09 (Frontend).
- No se requiere ningún cambio en el esquema aprobado (INF-05 v1.2) ni en INF-07 v1.2 como consecuencia de este ADR: ambos ya eran coherentes con esta decisión.
