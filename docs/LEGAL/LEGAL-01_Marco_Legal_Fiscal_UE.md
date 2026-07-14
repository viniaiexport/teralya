# LEGAL-01 — Marco Legal y Fiscal para la Venta de Vino en la UE

**Teralya · Versión 1.0 · Julio 2026 · Preparado por Claude · Estado: BORRADOR INICIAL DE TRABAJO**

## ⚠️ Aviso obligatorio

Este documento es investigación preliminar recopilada de fuentes públicas (legislación de la UE, portales oficiales de la Comisión Europea, y asesorías fiscales especializadas citadas). **No es asesoramiento legal ni fiscal.** Antes de lanzar Teralya, este documento debe ser revisado y validado por un abogado especializado en comercio electrónico/UE y por un asesor fiscal especializado en impuestos especiales (excise duty) sobre bebidas alcohólicas. Su función es dar un punto de partida ordenado, no sustituir esa revisión profesional.

---

## 1. Mayoría de edad para comprar alcohol en la UE

**Regla general: 18 años** en la gran mayoría de los Estados miembros (21 de 27, incluidos Francia, Italia, España, Grecia, Irlanda, Países Bajos, Polonia, Portugal, Finlandia, Suecia). No existe armonización legal a nivel de la UE — cada país fija su propio mínimo, y los intentos de armonizar en 2005, 2007 y 2015 no prosperaron.

**Excepciones relevantes para vino específicamente:**

| País | Edad mínima para vino | Nota |
|---|---|---|
| Alemania | 16 | Cerveza y vino a los 16; licores a los 18 |
| Bélgica | 16 | Igual que Alemania |
| Austria | 16 | Igual que Alemania |
| Dinamarca | 16 (bebidas ≤6% vol.) / 18 (>6%) | Cambió en abril de 2025: la mayoría de vinos (>6% vol.) ya requieren 18 años |
| Resto de la UE (21 países) | 18 | Sin excepción por tipo de bebida |

**Recomendación para el MVP:** fijar **18 años como edad mínima única para toda la plataforma**, independientemente del país de envío. Es más estricto de lo legalmente exigido en Alemania, Bélgica y Austria para el vino, pero evita el riesgo y la complejidad de mantener una edad mínima distinta por país — y es coherente con la Decisión CTO ya aprobada (ADR/Decision Log) de mayoría de edad en el registro. **No cambiar esta recomendación sin validación legal.**

**Novedad a vigilar:** la Comisión Europea recomendó en abril de 2026 que todos los Estados miembros ofrezcan una European Digital Identity Wallet antes de fin de 2026, con la verificación de edad (incluida la compra de alcohol) como caso de uso previsto. Todavía no es una obligación operativa, pero puede convertirse en el estándar de verificación de edad online en los próximos años — a vigilar para no quedar por detrás cuando sea exigible.

---

## 2. Requisitos para vender alcohol online en toda la UE (venta a distancia)

Fuente principal: Directiva (UE) 2020/262 (sustituye a la Directiva 2008/118/CE), que regula los impuestos especiales armonizados.

**Principio clave: el impuesto especial (excise duty) se paga en el país de destino, no en el país de origen.** Cuando una bodega en España vende una botella a un comprador en Francia, el impuesto especial se paga en Francia, no en España.

**Obligaciones del vendedor (o de su representante fiscal) en cada país de destino al que se envíe:**
1. Registrarse ante la autoridad competente del país de destino antes de enviar.
2. Obtener un número de impuesto especial (excise number) y, en algunos países, un representante fiscal acreditado localmente.
3. Aportar una garantía financiera que cubra el impuesto especial.
4. Pagar el impuesto especial una vez el producto llega al destino final.
5. Llevar contabilidad de los envíos sujetos a impuesto especial.
6. Acompañar cada envío de un documento (versión electrónica: e-AD, sistema EMCS) que acredite el registro.

**Países que exigen representante fiscal local obligatorio para venta B2C de alcohol** (lista no exhaustiva, verificar país por país antes de operar): **Francia** e **Italia** lo exigen explícitamente. Es razonable asumir que otros países exigen algo equivalente — debe verificarse uno por uno antes de habilitar el envío a cada país.

### ⚠️ Riesgo estructural importante para el modelo de Teralya

Dado que el modelo de negocio es **venta directa de la bodega al comprador** (Teralya no compra ni almacena stock, Decision Log), la obligación de registro/representación fiscal en el país de destino recae, en principio, **sobre cada bodega individualmente como vendedora**, no sobre Teralya como plataforma. Esto significa que, sin una solución centralizada, **cada bodega pequeña tendría que registrarse y mantener un representante fiscal en cada país al que quiera enviar** — una carga totalmente inviable para bodegas fundadoras pequeñas.

**Esto requiere una decisión estratégica del CEO antes de habilitar envíos multi-país**, con al menos tres caminos posibles a evaluar con un asesor fiscal:
- Limitar el envío inicial a un número reducido de países donde el trámite sea manejable.
- Contratar un servicio de representación fiscal centralizado (existen empresas especializadas: ASD Group, Eurotax y similares) que actúe en nombre de todas las bodegas de la plataforma.
- Estudiar si el modelo de Teralya podría calificar como "vendedor considerado" (deemed supplier) y asumir la plataforma parte de esta responsabilidad — esto depende de cómo se estructure jurídicamente la relación entre Teralya y las bodegas, y requiere asesoría legal específica.

**No se ha tomado ninguna decisión todavía sobre esto — queda explícitamente pendiente de decisión del CEO con asesoría profesional.**

---

## 3. IVA en venta a distancia dentro de la UE

- Cada Estado miembro fija su propio tipo general de IVA (mínimo legal 15%, sin máximo). Rango actual: **17% (Luxemburgo) a 27% (Hungría)**. Media UE ≈ 21,9%.
- Para venta B2C a distancia dentro de la UE, una vez superado el umbral combinado de **10.000 € anuales** de ventas a distancia a otros países de la UE, el vendedor debe aplicar el tipo de IVA del **país de destino** (del comprador), no el de origen.
- El régimen **OSS (One-Stop-Shop / Ventanilla Única)** permite declarar todo el IVA de ventas a distancia intracomunitarias en una única declaración, en vez de registrarse en cada país por separado — muy recomendable para Teralya frente a un registro de IVA país por país.
- El vino no suele beneficiarse de tipos reducidos de IVA (a diferencia de alimentos básicos); se aplica normalmente el **tipo general** de cada país. Excepción a verificar: Luxemburgo aplica un tipo "parking" del 14% específicamente al vino (más bajo que su tipo general).

**Tabla orientativa de tipos generales de IVA (verificar antes de implementar — cambian con frecuencia):**

| País | IVA general | País | IVA general |
|---|---|---|---|
| Alemania | 19% | Italia | 22% |
| España | 21% | Países Bajos | 21% |
| Francia | 20% | Polonia | 23% |
| Portugal | 23% | Bélgica | 21% |
| Hungría | 27% (máximo UE) | Luxemburgo | 17% (mínimo UE) |
| Dinamarca | 25% | Suecia | 25% |
| Croacia | 25% | Finlandia | 25,5% |

*(Tabla no exhaustiva de los 27 — completar los 27 países antes de implementación real, y confirmar cada cifra contra la base de datos oficial TEDB de la Comisión Europea antes de codificar ningún tipo en el sistema.)*

**Recomendación técnica:** no fijar los tipos de IVA como valores estáticos en el código. Deben vivir en una tabla de configuración por país, revisable sin desplegar código nuevo, porque cambian con frecuencia (varios países ya han cambiado tipos en 2024-2026).

---

## 4. Cláusulas legales que Teralya necesita (documento por documento)

Para incorporar progresivamente, en este orden de prioridad:

1. **Términos y Condiciones de uso** (marketplace, no vendedor directo — debe dejar clarísimo que la bodega es la vendedora y Teralya el intermediario, según CU-006/CAP-02).
2. **Política de Privacidad (RGPD)** — obligatoria antes de recoger cualquier dato personal (registro, fecha de nacimiento, direcciones).
3. **Política de Cookies** — obligatoria si se usan cookies de analítica/sesión.
4. **Aviso de mayoría de edad y venta responsable de alcohol** — declaración explícita en el registro, ya contemplada en el modelo de datos (`declaracion_mayoria_edad`, `aceptacion_condiciones_alcohol`), pero falta el texto legal real de esa declaración.
5. **Política de derecho de desistimiento (14 días)** — **importante:** la excepción de la Directiva 2011/83/UE para vino ("vin en primeur") es muy estrecha — solo cubre vino especulativo con entrega diferida y valor sujeto a fluctuación de mercado. **La venta normal de vino de Teralya NO está exenta**: el comprador tiene derecho de desistimiento de 14 días como cualquier otro producto.
6. **Botón de cancelación de contrato ("Cancelar mi contrato")** — obligatorio desde el **19 de junio de 2026** (Directiva (UE) 2023/2673) para cualquier venta online en la UE. Como la fecha actual del proyecto es julio de 2026, **esta obligación ya está en vigor ahora mismo** — no es un requisito futuro, hay que incorporarlo antes de vender.
7. **Condiciones de venta y envío por bodega** — dado que la bodega gestiona su propio envío (Decision Log), cada bodega debería tener sus propias condiciones de envío visibles, dentro de un marco general de Teralya.
8. **Política de reembolsos e incidencias** — relacionada con CAP-06 (gestión de incidencias) y el modelo de Pedido/SubPedido ya aprobado.

---

## 5. Próximos pasos para la parte Legal

1. Confirmar con un abogado la edad mínima de 18 años recomendada en la §1.
2. Encargar a un asesor fiscal especializado en impuestos especiales sobre alcohol la decisión de la §2 (representación fiscal centralizada vs. por bodega vs. lanzamiento acotado a pocos países).
3. Completar la tabla de IVA de los 27 países (§3) contra la base de datos oficial TEDB antes de codificarla.
4. Redactar los 8 documentos de la §4, empezando por Términos y Condiciones y RGPD (son los que bloquean el registro de cualquier usuario).
5. Verificar el botón de cancelación de contrato (§4.6) cuanto antes — ya es exigible.

*Este documento queda en `docs/LEGAL/` como punto de partida. Se irá completando documento a documento según se vaya avanzando con asesoría profesional real.*
