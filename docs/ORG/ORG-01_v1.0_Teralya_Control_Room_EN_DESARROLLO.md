# ORG-01 — Teralya Control Room

**Versión 1.0 · 28/07/2026 · Estado: EN DESARROLLO**

## Objetivo

Crear un canal único de coordinación entre el CEO, ChatGPT y Claude para eliminar el trabajo manual de copiar y pegar mensajes, instrucciones, resultados y bloqueos entre agentes.

## Principio operativo

El CEO escribe una sola vez. El sistema clasifica la petición, la asigna al agente responsable, conserva el contexto oficial, registra el resultado y devuelve una respuesta consolidada al mismo canal.

El CEO no actuará como puente operativo entre agentes.

## Participantes

- **CEO — Ignacio:** decisiones de negocio, aprobación final y prioridades.
- **CTO — ChatGPT:** orquestación, arquitectura, validación y publicación.
- **Claude + Code:** revisión técnica, corrección y ejecución delegada.
- **Subagente Control Room:** enrutamiento, seguimiento, estados y auditoría.

## Arquitectura funcional mínima

1. **Interfaz tipo WhatsApp:** chat único accesible desde móvil y ordenador.
2. **Orquestador:** identifica destinatario, prioridad, contexto, permisos y dependencias.
3. **Memoria compartida:** GitHub, `docs/INDEX.md`, `docs/BIZ` y Decision Log.
4. **Bandeja de tareas:** responsable, estado, fecha, evidencia, resultado y bloqueo.
5. **Auditoría:** historial íntegro de solicitudes, decisiones, acciones y cambios.
6. **Gates humanos:** pagos, producción, datos personales, economía y arquitectura.

## Contrato de mensajes propuesto

Cada mensaje deberá incluir como mínimo:

- `id`
- `fecha_hora`
- `emisor`
- `destinatario`
- `tipo`
- `prioridad`
- `proyecto`
- `tarea`
- `contexto_oficial`
- `permisos_requeridos`
- `estado`
- `resultado`
- `evidencias`
- `bloqueos`
- `requiere_aprobacion`

## Estados

`recibida → clasificada → asignada → en_ejecucion → en_revision → aprobada → publicada → cerrada`

Estados alternativos:

- `bloqueada`
- `rechazada`
- `cancelada`

## Prioridades

### P0

- Definir el bus de agentes y el contrato de mensajes.
- Crear la bandeja compartida de tareas.
- Resolver la ruta de escritura de Claude o sustituirla por publicación gestionada por el CTO.
- Evitar que el CEO intervenga como mensajero entre agentes.

### P1

- Crear interfaz móvil y web tipo WhatsApp.
- Conectar ChatGPT, Claude y GitHub mediante APIs seguras.
- Añadir aprobaciones explícitas.
- Registrar costes, errores, tiempos y uso por agente.

### P2

- Incorporar agentes de marketing, redes sociales, blog, SEO y GEO.
- Incorporar un supervisor de las IA de plataforma.

## Límites

- El Control Room no sustituye `docs/INDEX.md` ni el Decision Log.
- Ningún agente puede aprobar decisiones de negocio reservadas al CEO.
- Ningún agente puede activar producción, ejecutar pagos reales o ampliar el MVP sin autorización.
- Las conversaciones no se almacenarán con datos personales hasta cerrar RGPD, retención y borrado.

## Dependencias

- AI-01
- OPS-01
- LEGAL-04
- autenticación y permisos de Claude
- proveedor de mensajería o interfaz propia
- proveedor de modelos y presupuesto

## Bloqueos abiertos

- Claude dispone de lectura y trabajo local, pero su proxy de sesión no permite `push` directo.
- No existe todavía un canal bidireccional automatizado entre ChatGPT y Claude.
- No se han aprobado proveedor, presupuesto, política de conservación ni permisos del canal.

## Siguiente paso

Definir la arquitectura técnica del bus de agentes y seleccionar entre:

1. interfaz propia con integración posterior de WhatsApp;
2. WhatsApp Business como interfaz desde la primera versión;
3. canal interno web como MVP del Control Room.

La recomendación técnica inicial es una interfaz propia tipo WhatsApp y conexión posterior con WhatsApp Business, para reducir dependencia externa y acelerar la primera versión.
