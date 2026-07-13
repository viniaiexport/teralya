# Decision Log — Teralya

**Versión 1.6 · Julio 2026 · Registro oficial de decisiones del proyecto.** Cada decisión relevante queda aquí con fecha y motivo, para no perder el razonamiento ni repetir discusiones ya cerradas.

| ID | Decisión | Motivo | Fecha | Estado |
|---|---|---|---|---|
| 0001 | Nombre de marca: **Teralya** | Único candidato de 23 evaluados sin conflicto directo en clases 33/35 tras due diligence en TMview/OEPM/web | 02/07/2026 | Aprobada (riesgo residual en Benelux clases 25/41 aceptado conscientemente) |
| 0002 | Estructura de equipo: CEO (Ignacio) / CTO (ChatGPT) / Claude / Codex-Lovable, con gate no delegable de revisión técnica + validación funcional en Pagos y Pedidos | Combinar la velocidad de los agentes de IA con control humano real en los módulos donde un error cuesta dinero de terceros | 03/07/2026 | Aprobada |
| 0003 | Modelo de usuario: fusión de "Usuario Base" y "Usuario" en una única tabla `usuario`; `comprador` como extensión 1:1; `bodega` independiente con relación 1:N hacia `usuario`; `administrador` como rol sin tabla propia | Resolver la Contradicción 1 detectada entre las Entidades 01 y 04 | 09/07/2026 | Aprobada por el CTO |
| 0004 | `pago` sin FK directa a `cuenta_stripe_connect`; el reparto se resuelve vía `subpedido → bodega → cuenta_stripe_connect` | El modelo es multi-bodega y una relación singular no podía representarlo | 09/07/2026 | Corregida técnicamente |
| 0005 | `subpedido.estado` como única fuente de verdad del flujo logístico; `pedido_item.estado` reducido a `normal / cancelado / devuelto` | Resolver estados logísticos duplicados | 09/07/2026 | Aprobada por el CTO |
| 0006 | Verificación de mayoría de edad obligatoria en el registro de comprador, sin verificación documental en el MVP | Cumplimiento en venta de alcohol con fricción proporcionada | 09/07/2026 | Aprobada por el CTO |
| 0007 | Interfaz multilingüe desde el MVP: español, inglés, francés, alemán e italiano | Teralya nace como marketplace europeo | 09/07/2026 | Aprobada por el CTO |
| 0008 | Comisión objetivo estándar: **10%**, con reducciones temporales únicamente aprobadas por el CEO | Sostenibilidad y competitividad | 12/07/2026 | Aprobada por el CEO |
| 0009 | Fecha objetivo de lanzamiento del MVP: **octubre de 2026** | Llegar antes de Navidad sin ampliar alcance | 12/07/2026 | Aprobada por el CEO |
| 0010 | Carrito de visitante local en navegador; persistencia y fusión solo tras autenticación; checkout autenticado | Resolver contradicción entre pantalla de visitante y esquema con `comprador_id NOT NULL` | 12/07/2026 | Aprobada por el CEO (ADR-001) |
| 0011 | Autenticación autogestionada por el backend de Teralya; sin proveedor de identidad externo en el MVP | Mantener coherencia entre esquema, API y Frontend | 12/07/2026 | Aprobada por el CEO (ADR-002) |
| 0012 | Frontend con **Next.js y App Router**, no Pages Router, manteniendo React + TypeScript | Cerrar framework y sistema de rutas antes de implementar | 12/07/2026 | Aprobada por el CTO (ADR-003) |
| 0013 | **Una única aplicación Next.js y un único despliegue Frontend para público, acceso, comprador, bodega, administrador y sistema**, con grupos de rutas y layouts separados; autorización real en backend | Resolver la contradicción entre los dos frontends históricos de INF-07 v1.2 y la aplicación única de INF-09; reducir duplicación y retrabajo sin debilitar seguridad | 12/07/2026 | Aprobada por el CTO con autorización expresa del CEO (ADR-004) |
| 0014 | `pago.estado` es la única fuente persistente del estado económico del pago; se eliminan los campos duplicados de Pedido | Evitar divergencias y mantener al webhook de Stripe como autoridad de confirmación | 13/07/2026 | Aprobada por el CEO; aplicada en INF-05 v1.3 |
| 0015 | Ciclo mínimo de Incidencia: `abierta → en_revision → resuelta → cerrada`, sin reaperturas ni soporte avanzado en el MVP | Hacer implementable API-042 y conservar un flujo administrativo mínimo y auditable | 13/07/2026 | Aprobada por el CEO; aplicada en INF-05 v1.3 |
| 0016 | Idempotencia e integridad comercial garantizadas en base de datos mediante carrito único por Pedido, ledger de eventos Stripe y claves compuestas Pedido–Pago–SubPedido–Línea–Bodega | Evitar duplicidades de cobro, SubPedidos duplicados y relaciones comerciales incoherentes | 13/07/2026 | Aprobada por el CEO; aplicada en INF-05 v1.3 |
| 0017 | Al fusionar el mismo vino desde carrito local y persistente, la cantidad resultante es `min(stock_disponible, cantidad_persistente + cantidad_local)`; cada instantánea local usa un `fusion_id` idempotente | Conservar la intención de compra sin superar stock ni duplicar cantidades en reintentos | 13/07/2026 | Aprobada por el CEO; aplicada en INF-05 v1.4, INF-06 v1.3, CAP-02 v1.3, INF-08 v2.3 y CAP-08 v1.2 |
| 0018 | `pedido.estado` logístico se deriva determinísticamente del conjunto de `subpedido.estado` mediante la matriz pagado / en_preparacion / parcialmente_enviado / enviado / entregado / cancelado | Convertir DLOG 0005 en una regla comprobable y evitar escrituras globales arbitrarias | 13/07/2026 | Aprobada por el CEO; aplicada en INF-08 v2.3 y CAP-08 v1.2 |
| 0019 | Formalizar ocho operaciones faltantes del MVP: cuatro para Direcciones propias y cuatro para Imágenes de vino mediante carga directa prefirmada y confirmación; API-001 a API-042 conservan códigos, métodos y rutas. Se autorizan las precisiones semánticas coordinadas de API-016/API-029 sobre snapshots, API-025/API-034 sobre imagen confirmada y activa, y sus CA asociados. Las eliminaciones son lógicas e idempotentes, el propietario se deriva de sesión y se protege la última imagen obligatoria. | Cerrar TAPI-07 y hacer implementables end-to-end requisitos ya obligatorios de checkout y publicación sin ampliar el MVP | 13/07/2026 | Aprobada por el CEO; aplicada y aprobada por el CTO en CAP-07 v1.3, CAP-08 v1.3 e INF-08 v2.4 tras doble dictamen APROBABLE |
| 0020 | Cerrar TAPI-01→06 y TAPI-08→09 sin añadir rutas: sesión HTTP Bearer opaca de 256 bits con TTL absoluto de 8 h y sin refresh; EUR como única moneda del MVP e importes decimales string; `application/problem+json` y paginación page/page_size 1/20/100; allowlist Stripe de cuatro eventos `checkout.session.*`; matriz exacta y terminal de SubPedido; retirada del 402 de API-017; y DTO/proyecciones/límites cerrados. API-001→050 conservan código, método y ruta. | Hacer que INF-10 y el futuro OpenAPI 3.1 sean deterministas, verificables y compatibles con las fuentes funcionales, eliminando ambigüedades de sesión, pago, logística y exposición de datos | 13/07/2026 | Aprobada por el CEO; aplicación coordinada en CAP-08 v1.4, INF-08 v2.5 e INF-10 v1.0 EN REVISIÓN |

---

## Nota de higiene documental

El documento `Marketplace_Europeo_Bodegas_Fundadoras_Ruta_50p_v0_2.pdf` es histórico y no constituye fuente normativa.

- Su objetivo de comisión del 7% queda sustituido por la Decisión 0008.
- Su objetivo de lanzamiento en octubre de 2026 queda confirmado por la Decisión 0009.
- Cualquier otro supuesto debe contrastarse con `docs/INDEX.md` y este Decision Log.
