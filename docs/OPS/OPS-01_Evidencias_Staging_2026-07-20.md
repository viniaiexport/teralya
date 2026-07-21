# OPS-01 — Evidencias de staging

**Fecha:** 20/07/2026  
**Commit desplegado:** `b02d07e39852f9811ae6e9deb05547bdedc4c59b`  
**Entorno:** `https://staging.teralya.eu`

## Evidencias técnicas cerradas

- Pipeline automático completo en verde:
  - Frontend.
  - Infraestructura.
  - Construcción de imágenes de staging.
  - Verificación pública del commit desplegado.
- Reconciliación automática desde Hetzner cada minuto, sin abrir SSH a las IP dinámicas de GitHub Actions.
- Frontend, Backend, PostgreSQL, Redis y Caddy operativos.
- Readiness pública del Backend correcta, con PostgreSQL y Redis disponibles.
- Esquema PostgreSQL v1.5 presente con 20 tablas.
- Copia `pg_dump` creada, restaurada en una base temporal y validada con 20 tablas; la base temporal se eliminó al terminar.
- `.env.staging` con permisos `0600` y todos los grupos obligatorios presentes.
- DNS de `staging.teralya.eu` resuelto a Cloudflare.
- HTTPS público correcto, HSTS activo y servidor identificado como Cloudflare.
- Origen Hetzner no accesible directamente por TCP 80/443 desde Internet.
- PostgreSQL 5432 y Redis 6379 no expuestos públicamente.
- Cabeceras CSP, `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff` presentes.
- Rutas públicas, privadas y legales principales responden correctamente.
- Mayor tiempo observado en el recorrido HTTP básico: 796 ms.
- Bucket R2 UE validado mediante escritura, lectura y borrado de un objeto temporal.
- Stripe de pruebas validado mediante autenticación real contra su API.
- SMTP validado mediante conexión y autenticación real.
- Webhook Stripe público y activo; las solicitudes sin firma válida son rechazadas.
- Logotipo cristal aprobado publicado y servido como recurso estático.

## Validación funcional adicional del 21/07/2026

- Portada validada con perfiles reales de iPhone y Android: respuesta 200, sin errores JavaScript y sin desbordamiento horizontal.
- Registro de comprador, creación de sesión, cierre y reingreso ejecutados contra staging con datos sintéticos controlados.
- Detectada y corregida la incoherencia que dejaba al comprador en `pendiente_verificacion` sin existir un flujo de verificación de email en el MVP.
- Backend, contrato OpenAPI e imágenes de staging validados en verde para el commit de la corrección.
- Reingreso del comprador confirmado en staging tras el despliegue.
- Solicitud profesional de bodega y solicitud de recuperación de contraseña confirmadas en staging.

## Gates que no son ejecutables como decisión técnica

- Aprobación formal por Seguridad de límites y ventanas de autenticación y recuperación.
- Aprobación por el CEO de la política operativa ante cobro confirmado sin stock.
- Revisión jurídica y fiscal externa antes de operar comercialmente o a escala multi-país.

Quedan por completar los recorridos controlados que requieren datos operativos de Bodega y Administrador, incluido el checkout de prueba de extremo a extremo. Producción continúa bloqueada por esos recorridos y por los gates de aprobación y revisión anteriores. No se han usado secretos ficticios ni se ha ampliado el MVP.
