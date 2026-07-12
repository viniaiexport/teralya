# ADR-001 — Carrito de visitante

**Estado:** Aceptado
**Fecha:** Julio 2026
**Decide:** CEO

## Contexto

CAP-05 (PT-COM-002, Carrito) lista como usuarios autorizados "Visitante, Comprador". INF-05 define `carrito.comprador_id` como `NOT NULL` con FK obligatoria a `comprador.usuario_id`: no puede existir una fila de `carrito` sin un comprador autenticado. Esto es una contradicción entre el alcance funcional (CAP-05) y el modelo de datos aprobado (INF-05) que debía resolverse antes de construir el Frontend.

## Decisión

- El carrito de un visitante sin cuenta se mantiene **temporal y localmente en el navegador** (cliente).
- **No se persiste** en PostgreSQL ninguna fila de `carrito` para usuarios anónimos.
- Al registrarse o iniciar sesión, el sistema **valida** precio, publicación y disponibilidad de cada línea del carrito local, y **fusiona o copia** ese carrito al carrito persistente del comprador (`carrito`, `carrito_item`).
- **El checkout siempre requiere autenticación** (CU-009); un visitante no puede completar una compra sin registrarse o iniciar sesión primero.
- `carrito.comprador_id` se mantiene como `NOT NULL` — no se modifica el esquema de INF-05.

## Consecuencias

- Los endpoints de INF-08 que operan sobre la tabla `carrito` (API-011 a API-015) son de uso exclusivo del **Comprador** autenticado; ninguno se invoca para un visitante. Corrección aplicada en la auditoría de coherencia: API-012 pasaba incorrectamente de "Visitante, Comprador" a "Comprador".
- El Frontend debe implementar un estado de carrito en cliente, independiente del estado de servidor, con lógica de fusión/validación al iniciar sesión (ver INF-09 §10).
- CAP-05 (PT-COM-002) sigue permitiendo que un visitante "vea y use" un carrito — esto se cumple en el cliente, no contradice el esquema.
