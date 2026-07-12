# INF-08 v2.1 — Auditoría de cobertura de Pantallas y Casos de Uso

**Teralya · Versión 1.0 · 12/07/2026 · Estado: BLOQUEO DE IMPLEMENTACIÓN PARCIAL**

## Objetivo

Identificar operaciones aprobadas en CAP-05, CAP-06 y CAP-07 que todavía no disponen de un endpoint explícito en INF-08 v2.1. Este documento no amplía el MVP y no reabre INF-09. Su única finalidad es definir el trabajo exacto para INF-08 v2.2.

## Resultado ejecutivo

INF-08 v2.1 contiene 29 endpoints válidos, pero no cubre todas las operaciones necesarias para las 36 pantallas y los 32 Casos de Uso oficiales. La arquitectura Frontend puede aprobarse, pero las pantallas afectadas no deben implementarse hasta aprobar INF-08 v2.2.

## Brechas obligatorias

### 1. Ficha pública de bodega

- **Pantalla:** PT-PUB-004.
- **Trazabilidad:** CU-006 como navegación alternativa; HU-006 y HU-014.
- **Operación necesaria:** consultar el perfil público de una bodega validada y sus vinos publicados.
- **Ruta propuesta para INF-08 v2.2:** `GET /bodegas/{id}`.

### 2. Consulta del perfil propio de bodega

- **Pantalla:** PT-BOD-002.
- **Trazabilidad:** CU-014 / HU-014.
- **Situación actual:** API-006 permite actualizar, pero no existe lectura explícita.
- **Ruta propuesta:** `GET /bodegas/yo/perfil`.

### 3. Listado de vinos propios de bodega

- **Pantalla:** PT-BOD-003.
- **Trazabilidad:** CU-015, CU-016 y CU-017 / HU-015 a HU-017.
- **Operación necesaria:** listar exclusivamente los vinos de la bodega autenticada, incluyendo estados no publicados o pendientes.
- **Ruta propuesta:** `GET /bodegas/yo/vinos`.

### 4. Detalle de vino propio de bodega

- **Pantalla:** PT-BOD-006.
- **Trazabilidad:** CU-015, CU-016 y CU-017 / HU-015 a HU-017.
- **Operación necesaria:** consultar un vino propio aunque todavía no sea público.
- **Ruta propuesta:** `GET /bodegas/yo/vinos/{id}`.

### 5. Solicitud de publicación de vino

- **Pantallas:** PT-BOD-003, PT-BOD-005, PT-BOD-006 y PT-ADM-004.
- **Trazabilidad:** CU-017 / HU-017.
- **Operación necesaria:** la bodega solicita revisión sin poder publicar directamente.
- **Ruta propuesta:** `POST /bodegas/yo/vinos/{id}/solicitar-publicacion`.

### 6. Listado de bodegas pendientes

- **Pantalla:** PT-ADM-002.
- **Trazabilidad:** CU-021 / HU-021.
- **Situación actual:** API-024 valida una bodega concreta, pero no define el listado previo.
- **Ruta propuesta:** `GET /admin/bodegas?estado=pendiente`.

### 7. Detalle administrativo de bodega

- **Pantalla:** PT-ADM-003.
- **Trazabilidad:** CU-021 / HU-021.
- **Ruta propuesta:** `GET /admin/bodegas/{id}`.

### 8. Listado de vinos pendientes de revisión

- **Pantalla:** PT-ADM-004.
- **Trazabilidad:** CU-022, CU-023 y CU-024 / HU-022 a HU-024.
- **Situación actual:** API-025 y API-026 ejecutan publicación/despublicación, pero no proporcionan el listado de revisión.
- **Ruta propuesta:** `GET /admin/vinos?estado=pendiente_revision`.

### 9. Detalle administrativo de vino

- **Pantalla:** PT-ADM-005.
- **Trazabilidad:** CU-022, CU-023 y CU-024 / HU-022 a HU-024.
- **Ruta propuesta:** `GET /admin/vinos/{id}`.

### 10. Detalle administrativo de Pedido

- **Pantalla:** PT-ADM-007.
- **Trazabilidad:** CU-025 / HU-025.
- **Situación actual:** API-027 lista pedidos y menciona acceso al detalle, pero no formaliza una ruta individual.
- **Ruta propuesta:** `GET /admin/pedidos/{id}`.

### 11. Listado de incidencias

- **Pantalla:** PT-ADM-008.
- **Trazabilidad:** CU-027 / HU-027.
- **Ruta propuesta:** `GET /admin/incidencias`.

### 12. Detalle de incidencia

- **Pantalla:** PT-ADM-009.
- **Trazabilidad:** CU-027 / HU-027.
- **Ruta propuesta:** `GET /admin/incidencias/{id}`.

### 13. Actualización de incidencia

- **Pantallas:** PT-ADM-008 y PT-ADM-009.
- **Trazabilidad:** CU-027 / HU-027.
- **Operación necesaria:** aplicar únicamente transiciones permitidas y registrar auditoría.
- **Ruta propuesta:** `PATCH /admin/incidencias/{id}`.

## Verificaciones adicionales obligatorias para INF-08 v2.2

1. Confirmar que el registro de bodega crea o vincula las credenciales necesarias para el modelo de autenticación propio de ADR-002, sin inventar un segundo flujo de identidad.
2. Mantener API-003 sin enumeración de cuentas.
3. Mantener API-012 exclusivamente para Comprador autenticado.
4. Mantener la idempotencia de API-016, API-017 y API-029.
5. No añadir endpoints para funcionalidades excluidas del MVP.
6. Actualizar el índice de módulos y el conteo total real de endpoints.
7. Actualizar INF-09 §19 solo para sustituir la referencia de versión del contrato cuando INF-08 v2.2 sea aprobada; no reabrir su arquitectura.

## Criterio de cierre

La auditoría cierra cuando INF-08 v2.2 contiene contratos explícitos para las trece operaciones anteriores, conserva los 29 endpoints válidos existentes, supera una matriz CU/HU/PT → API sin huecos operativos y no incorpora funcionalidad fuera del MVP.

## Estado

- **INF-09:** arquitectura aprobada.
- **INF-08 v2.1:** válido parcialmente, EN REVISIÓN.
- **Implementación:** permitida únicamente para pantallas con endpoints aprobados; bloqueada para las operaciones enumeradas hasta INF-08 v2.2.
