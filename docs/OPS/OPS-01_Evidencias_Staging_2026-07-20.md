# OPS-01 — Evidencias de staging

**Fecha inicial:** 20/07/2026  
**Última actualización:** 28/07/2026  
**Commit inicialmente desplegado:** `b02d07e39852f9811ae6e9deb05547bdedc4c59b`  
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

- Se ejecutaron pruebas con perfiles de iPhone y Android que devolvieron respuesta 200, sin errores JavaScript ni desbordamiento horizontal en el recorrido observado.
- Registro de comprador, creación de sesión, cierre y reingreso ejecutados contra staging con datos sintéticos controlados.
- Detectada y corregida la incoherencia que dejaba al comprador en `pendiente_verificacion` sin existir un flujo de verificación de email en el MVP.
- Backend, contrato OpenAPI e imágenes de staging validados en verde para el commit de la corrección.
- Reingreso del comprador confirmado en staging tras el despliegue.
- Solicitud profesional de bodega y solicitud de recuperación de contraseña confirmadas en staging.
- Recorrido profesional controlado completado el 21 de julio de 2026 con datos sintéticos identificables: solicitud de bodega, aparición en la cola de Administración, aprobación administrativa, activación del usuario profesional, inicio de sesión de Bodega y lectura de su perfil propio.
- La validación anterior se ejecutó dentro de la red privada de staging mediante el acceso SSH dedicado ya configurado; no se publicó la API general ni se expusieron PostgreSQL o Redis.

## Corrección de estado del 28/07/2026

La afirmación anterior de que la portada móvil estaba validada no constituye aceptación definitiva. El CEO ha comunicado, tras usar la web en un teléfono real, que la experiencia móvil seguía sin funcionar correctamente. Por tanto:

- la validación móvil se reabre como bloqueo P0 de OPS-01;
- FE-002 y FE-008 permanecen implementados en código, pero su aceptación operativa móvil queda pendiente;
- las pruebas emuladas, E2E y capturas no sustituyen la comprobación física en Android e iPhone;
- no se considerará cerrado el gate hasta verificar portada, navegación, selector de idioma, catálogo, ficha de vino, acceso, carrito y checkout sin errores bloqueantes, contenido recortado, scroll horizontal o controles solapados;
- producción continúa bloqueada.

## Gates que no son ejecutables como decisión técnica

- Aprobación formal por Seguridad de límites y ventanas de autenticación y recuperación.
- Aprobación por el CEO de la política operativa ante cobro confirmado sin stock.
- Revisión jurídica y fiscal externa antes de operar comercialmente o a escala multi-país.

## Pendientes operativos

- Revalidación móvil en teléfonos Android e iPhone reales y aceptación expresa del CEO.
- Checkout de prueba de extremo a extremo con Stripe test y recorrido Connect multi-bodega.
- Gates de aprobación y revisión anteriores.

Los recorridos controlados de Comprador, Bodega y Administrador ya están ejecutados. Producción continúa bloqueada hasta el cierre completo de OPS-01. No se han usado datos comerciales reales ni se ha ampliado el MVP.