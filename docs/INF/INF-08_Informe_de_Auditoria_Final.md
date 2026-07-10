# INF-08 - Informe de Auditoría Final

**Teralya · Julio 2026 · Preparado por Claude**

Auditoría de INF-08 v2.0 contra CAP-01 a CAP-08, aplicando la regla del CTO: **se mantiene un endpoint si es técnicamente necesario para implementar una pantalla, flujo, regla o caso de uso aprobado, aunque no tenga un CU exclusivo**. Solo se elimina lo que introduce funcionalidad nueva fuera del MVP. Ningún endpoint fue eliminado en esta auditoría: los 29 de la v2.0 se mantienen, todos con soporte directo en CAP-01/03/04/05/06.

## Verificación por punto señalado por el CTO

| Punto a revisar | Verificación contra CAP-01/03/04/05/06 | Resultado |
|---|---|---|
| Perfil básico para Mi Cuenta | CAP-03 Módulo 1 confirma "Mi Cuenta" como destino tras login; ningún módulo describe edición de perfil de comprador como funcionalidad propia | No se añade endpoint de perfil — no está en el alcance aprobado |
| Dirección en checkout | CAP-04 FL-COM-010 confirma "confirma dirección de envío" dentro de Checkout, sin CRUD independiente | API-016 (Realizar checkout) ya cubre esto correctamente; no se amplía |
| Idiomas soportados / preferencia | CAP-03 Módulo 3 y CAP-04 FL-SIS-001 cubren detección/selección de idioma **solo durante el registro** | Ya cubierto por API-001 (registro); no se requiere endpoint adicional |
| Webhook de Stripe | CAP-04 FL-SIS-003 y FL-SIS-004 | API-029 correcto y necesario — mantener |
| Flujo de Stripe Checkout | CAP-03 Módulo 11 y CAP-04 FL-COM-011 confirman sesión + redirección + confirmación por sistema | API-016/017/018 correctos — mantener |
| Solicitud, aprobación y despublicación de vinos | CAP-04 FL-BOD-007 (solicitar, Bodega), FL-ADM-006 (publicar, Administrador), FL-ADM-007 (despublicar, Administrador) | API-025/026 correctos (actor Administrador) — mantener |
| Dashboard limitado a 2 indicadores | CAP-03 Módulo 10 y CAP-04 FL-ADM-002: "el dashboard del MVP solo muestra ventas del día y pedidos pendientes" | API-028 correcto y ya recortado a estos 2 indicadores — mantener |
| Separación Pedido / SubPedido | CAP-01, CAP-03 Módulo 11, CAP-04 FL-SIS-004/005: Pedido es la unidad del comprador y el sistema; SubPedido es interno, gestionado solo por la bodega correspondiente | Módulos Pedidos y SubPedidos ya reflejan esta separación — mantener |
| Control de acceso por rol | CAP-04 FL-SIS-002 lo define como comportamiento transversal, no endpoint propio | No requiere endpoint dedicado; ya reflejado en "Actor autorizado" de cada endpoint |

## Detalle endpoint por endpoint

| Código | Decisión | Justificación documental | CAP / CU / Pantalla que lo sustenta | Cambio realizado |
|---|---|---|---|---|
| API-001 | Mantener | Registro con mayoría de edad e idioma | CU-001; PT-ACC-001; CAP-03 Mód. 2-3; CAP-04 FL-COM-001 | Ninguno |
| API-002 | Mantener | Inicio de sesión | CU-002; PT-ACC-003; CAP-04 FL-COM-002 | Ninguno |
| API-003 | Mantener | Recuperar contraseña — solicitar | CU-003; PT-ACC-004; CAP-04 FL-COM-003 | Ninguno |
| API-004 | Mantener | Recuperar contraseña — nueva | CU-003; PT-ACC-005; CAP-04 FL-COM-003 | Ninguno |
| API-005 | Mantener | Solicitar registro de bodega | CU-012; PT-ACC-002; CAP-04 FL-BOD-001 | Ninguno |
| API-006 | Mantener | Completar perfil de bodega | CU-014; PT-BOD-002; CAP-04 FL-BOD-004 | Ninguno |
| API-007 | Mantener | Crear vino | CU-015; PT-BOD-004; CAP-04 FL-BOD-005 | Ninguno |
| API-008 | Mantener | Editar vino propio | CU-016; PT-BOD-005; CAP-04 FL-BOD-006 | Ninguno |
| API-009 | Mantener | Catálogo público / búsqueda | CU-004/005; PT-PUB-002; CAP-04 FL-COM-004/005 | Ninguno |
| API-010 | Mantener | Ficha de vino | CU-006; PT-PUB-003; CAP-04 FL-COM-006 | Ninguno |
| API-011 | Mantener | Añadir al carrito | CU-007; PT-COM-002; CAP-04 FL-COM-008 | Ninguno |
| API-012 | Mantener | Consultar carrito | CU-008; PT-COM-002; CAP-04 FL-COM-009 | Ninguno |
| API-013 | Mantener | Modificar cantidad | CU-008; PT-COM-002; CAP-04 FL-COM-009 | Ninguno |
| API-014 | Mantener | Eliminar producto del carrito | CU-008; PT-COM-002; CAP-04 FL-COM-009 | Ninguno |
| API-015 | Mantener | Vaciar carrito | CU-008; PT-COM-002; CAP-04 FL-COM-009 | Ninguno |
| API-016 | Mantener | Checkout (incluye dirección) | CU-009; PT-COM-003; CAP-04 FL-COM-010 | Ninguno |
| API-017 | Mantener | Pagar Pedido vía Stripe Checkout | CU-010; PT-COM-004; CAP-04 FL-COM-011 | Ninguno |
| API-018 | Mantener | Consultar confirmación de Pedido | CU-010/028; PT-COM-005; CAP-04 FL-COM-012 | Ninguno |
| API-019 | Mantener | Consultar Pedidos (comprador) | CU-011; PT-COM-006; CAP-04 FL-COM-013 | Ninguno |
| API-020 | Mantener | Detalle de Pedido (comprador) | CU-011; PT-COM-007; CAP-04 FL-COM-014 | Ninguno |
| API-021 | Mantener | SubPedidos de bodega — listar | CU-018; PT-BOD-007; CAP-04 FL-BOD-008 | Ninguno |
| API-022 | Mantener | SubPedidos de bodega — detalle | CU-018; PT-BOD-008; CAP-04 FL-BOD-009 | Ninguno |
| API-023 | Mantener | Cambiar estado de SubPedido | CU-019; PT-BOD-008; CAP-04 FL-BOD-010 | Ninguno |
| API-024 | Mantener | Validar bodega | CU-021; PT-ADM-002/003; CAP-04 FL-ADM-004 | Ninguno |
| API-025 | Mantener | Publicar vino (Administrador) | CU-023; PT-ADM-004/005; CAP-04 FL-ADM-006 | Ninguno (ya corregido en v2.0) |
| API-026 | Mantener | Despublicar vino (Administrador) | CU-024; PT-ADM-004/005; CAP-04 FL-ADM-007 | Ninguno (ya corregido en v2.0) |
| API-027 | Mantener | Consultar Pedidos (admin) | CU-025; PT-ADM-006/007; CAP-04 FL-ADM-008 | Ninguno |
| API-028 | Mantener | Dashboard (2 indicadores) | CU-026; PT-ADM-001; CAP-04 FL-ADM-002 | Ninguno (ya recortado en v2.0) |
| API-029 | Mantener | Webhook de Stripe | CU-028/029; CAP-04 FL-SIS-003/004 | Ninguno |

## Conclusión

Los 29 endpoints de INF-08 v2.0 son consecuencia directa y verificable de CAP-01 a CAP-08. No se identifica ninguna funcionalidad que amplíe el alcance aprobado ni ningún endpoint aprobado que falte para las pantallas y flujos definidos. **INF-08 v2.0 queda ratificado sin cambios tras esta auditoría.**

*No se inicia INF-09. En espera de aprobación del CTO.*
