# Decision Log — Teralya

**Versión 1.1 · Julio 2026 · Registro oficial de decisiones del proyecto.** Cada decisión relevante queda aquí con fecha y motivo, para no perder el razonamiento ni repetir discusiones ya cerradas.

| ID | Decisión | Motivo | Fecha | Estado |
|---|---|---|---|---|
| 0001 | Nombre de marca: **Teralya** | Único candidato de 23 evaluados sin conflicto directo en clases 33/35 tras due diligence en TMview/OEPM/web | 02/07/2026 | Aprobada (riesgo residual en Benelux clases 25/41 aceptado conscientemente) |
| 0002 | Estructura de equipo: CEO (Ignacio) / CTO (ChatGPT) / Claude / Codex-Lovable, con gate no delegable de revisión técnica + validación funcional en Pagos y Pedidos | Combinar la velocidad de los agentes de IA con control humano real en los módulos donde un error cuesta dinero de terceros | 03/07/2026 | Aprobada |
| 0003 | Modelo de usuario: fusión de "Usuario Base" y "Usuario" en una única tabla `usuario`; `comprador` como extensión 1:1; `bodega` independiente con relación 1:N hacia `usuario`; `administrador` como rol sin tabla propia | Resolver la Contradicción 1 detectada entre las Entidades 01 y 04 (dos modelos de datos incompatibles para el mismo concepto) | 09/07/2026 | Aprobada por el CTO |
| 0004 | `pago` sin FK directa a `cuenta_stripe_connect`; el reparto se resuelve vía `subpedido → bodega → cuenta_stripe_connect` | Corrección técnica: el modelo es multi-bodega, una relación singular no podía representarlo | 09/07/2026 | Corregida (no requería decisión de negocio) |
| 0005 | `subpedido.estado` como única fuente de verdad del flujo logístico; `pedido_item.estado` reducido a `normal / cancelado / devuelto` | Resolver la Contradicción 4 (estados logísticos duplicados entre dos tablas sin fuente de verdad clara) | 09/07/2026 | Aprobada por el CTO |
| 0006 | Verificación de mayoría de edad obligatoria en el registro de comprador: fecha de nacimiento + declaración + aceptación de condiciones de venta de alcohol, con registro para auditoría. Sin verificación documental de identidad en el MVP | Obligación legal de la venta de alcohol en la UE; equilibrio entre cumplimiento y fricción de registro en el MVP | 09/07/2026 | Aprobada por el CTO |
| 0007 | Plataforma multilingüe desde el MVP: español, inglés, francés, alemán, italiano. Detección de idioma del navegador + selección manual + idioma guardado por usuario. Arquitectura preparada para traducción de contenidos futura, sin diseñar aún el sistema de traducción de vinos/bodegas | Teralya nace con vocación de mercado paneuropeo, no solo español | 09/07/2026 | Aprobada por el CTO |
| 0008 | Comisión objetivo estándar de Teralya: **10%** sobre las ventas. Se permiten reducciones de lanzamiento y promociones puntuales aprobadas por el CEO, limitadas en duración y alcance; estas acciones no modifican el porcentaje estándar | Equilibrar competitividad para las bodegas, sostenibilidad económica de la plataforma y capacidad para financiar pagos, soporte, cumplimiento y crecimiento. Sustituye el objetivo preliminar del 7% | 12/07/2026 | Aprobada por el CEO |
| 0009 | Fecha objetivo de lanzamiento del MVP: **octubre de 2026** | Llegar al mercado antes de la campaña de Navidad de 2026, manteniendo el alcance estrictamente limitado al MVP aprobado | 12/07/2026 | Aprobada por el CEO |

---

## Nota de higiene documental

El documento anterior `Marketplace_Europeo_Bodegas_Fundadoras_Ruta_50p_v0_2.pdf` (29/06/2026) es histórico y no constituye una fuente normativa. Utiliza la marca de trabajo anterior y contiene supuestos preliminares.

- Su objetivo de comisión del 7% queda sustituido por la Decisión 0008: comisión estándar del 10%.
- Su objetivo de lanzamiento en octubre de 2026 queda confirmado y formalizado por la Decisión 0009.
- Cualquier otro supuesto del documento histórico debe contrastarse con `docs/INDEX.md` y con este Decision Log antes de utilizarse.
