# Decision Log — Teralya

**Registro de decisiones del proyecto.** Cada decisión relevante queda aquí con fecha y motivo, para no perder el razonamiento ni repetir discusiones ya cerradas (Blueprint, Cap. 7).

| ID | Decisión | Motivo | Fecha | Estado |
|---|---|---|---|---|
| 0001 | Nombre de marca: **Teralya** | Único candidato de 23 evaluados sin conflicto directo en clases 33/35 tras due diligence en TMview/OEPM/web | 02/07/2026 | Aprobada (riesgo residual en Benelux clases 25/41 aceptado conscientemente) |
| 0002 | Estructura de equipo: CEO (Ignacio) / CTO (ChatGPT) / Claude / Codex-Lovable, con gate no delegable de revisión técnica + validación funcional en Pagos y Pedidos | Combinar la velocidad de los agentes de IA con control humano real en los módulos donde un error cuesta dinero de terceros | 03/07/2026 | Aprobada |
| 0003 | Modelo de usuario: fusión de "Usuario Base" y "Usuario" en una única tabla `usuario`; `comprador` como extensión 1:1; `bodega` independiente con relación 1:N hacia `usuario`; `administrador` como rol sin tabla propia | Resolver la Contradicción 1 detectada entre las Entidades 01 y 04 (dos modelos de datos incompatibles para el mismo concepto) | 09/07/2026 | Aprobada por el CTO |
| 0004 | `pago` sin FK directa a `cuenta_stripe_connect`; el reparto se resuelve vía `subpedido → bodega → cuenta_stripe_connect` | Corrección técnica: el modelo es multi-bodega, una relación singular no podía representarlo | 09/07/2026 | Corregida (no requería decisión de negocio) |
| 0005 | `subpedido.estado` como única fuente de verdad del flujo logístico; `pedido_item.estado` reducido a `normal / cancelado / devuelto` | Resolver la Contradicción 4 (estados logísticos duplicados entre dos tablas sin fuente de verdad clara) | 09/07/2026 | Aprobada por el CTO |
| 0006 | Verificación de mayoría de edad obligatoria en el registro de comprador: fecha de nacimiento + declaración + aceptación de condiciones de venta de alcohol, con registro para auditoría. Sin verificación documental de identidad en el MVP | Obligación legal de la venta de alcohol en la UE; equilibrio entre cumplimiento y fricción de registro en el MVP | 09/07/2026 | Aprobada por el CTO |
| 0007 | Plataforma multilingüe desde el MVP: español, inglés, francés, alemán, italiano. Detección de idioma del navegador + selección manual + idioma guardado por usuario. Arquitectura preparada para traducción de contenidos futura, sin diseñar aún el sistema de traducción de vinos/bodegas | Teralya nace con vocación de mercado paneuropeo, no solo español | 09/07/2026 | Aprobada por el CTO |

---

*Nota de higiene documental: existe en Drive un documento anterior, "Marketplace_Europeo_Bodegas_Fundadoras_Ruta_50p_v0_2.pdf" (29/06/2026), previo al nombre Teralya, con supuestos ya superados (marca de trabajo "Vineo", comisión ~7%, lanzamiento octubre 2026, stack Next.js/Supabase/Vercel). Es un borrador anterior al Blueprint Fundacional, no una fuente activa — se recomienda archivarlo o marcarlo claramente como histórico para evitar que Codex/ChatGPT lo confundan con la especificación vigente.*
