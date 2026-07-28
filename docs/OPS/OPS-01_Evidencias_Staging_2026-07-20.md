# OPS-01 — Evidencias de staging

**Fecha inicial:** 20/07/2026  
**Última actualización:** 28/07/2026  
**Commit inicialmente desplegado:** `b02d07e39852f9811ae6e9deb05547bdedc4c59b`  
**Entorno:** `https://staging.teralya.eu`

## Evidencias técnicas cerradas

- Pipeline automático completo en verde: Frontend, Infraestructura, imágenes de staging y verificación pública del commit.
- Reconciliación automática desde Hetzner sin abrir SSH a las IP dinámicas de GitHub Actions.
- Frontend, Backend, PostgreSQL, Redis y Caddy operativos.
- Readiness pública del Backend correcta, con PostgreSQL y Redis disponibles.
- Esquema PostgreSQL v1.5 presente con 20 tablas.
- Copia `pg_dump` creada, restaurada y validada en una base temporal.
- `.env.staging` con permisos `0600` y grupos obligatorios presentes.
- DNS, HTTPS, HSTS y aislamiento del origen Hetzner verificados.
- PostgreSQL y Redis no expuestos públicamente.
- Cabeceras de seguridad principales presentes.
- R2 UE, Stripe test, SMTP y webhook Stripe validados.
- Logotipo aprobado publicado como recurso estático.

## Validación funcional del 21/07/2026

- Pruebas con perfiles de iPhone y Android sin errores JavaScript ni desbordamiento horizontal en el recorrido observado.
- Registro, sesión, cierre y reingreso de Comprador ejecutados con datos sintéticos controlados.
- Solicitud profesional, aprobación administrativa, activación e inicio de sesión de Bodega ejecutados.
- Recuperación de contraseña y rutas principales comprobadas.

## Incidencia móvil y cierre del 28/07/2026

El CEO comunicó inicialmente que la experiencia móvil seguía sin funcionar correctamente, por lo que el gate se reabrió como bloqueo P0 y se corrigió la documentación para no confundir pruebas emuladas con aceptación real.

Posteriormente, el 28/07/2026, el CEO confirmó expresamente: **«yo ya lo puedo ver en el móvil. sigamos con el siguiente paso»**. Con esta aceptación ejecutiva:

- el bloqueo móvil P0 queda cerrado;
- FE-002 y FE-008 recuperan su aceptación operativa móvil;
- la compatibilidad cruzada Android/iPhone se mantiene como prueba de regresión obligatoria antes de producción;
- cualquier nueva incidencia móvil reabrirá el gate correspondiente.

## Gates que requieren decisión o validación externa

- Aprobación formal por Seguridad de límites y ventanas de autenticación y recuperación.
- Aprobación por el CEO de la política operativa ante cobro confirmado sin stock.
- Revisión jurídica y fiscal externa antes de operar comercialmente o a escala multi-país.
- Checkout de extremo a extremo con Stripe test y recorrido Connect multi-bodega.
- Onboarding Connect y datos fiscales verificados de las Bodegas antes de pagos live.

Los recorridos controlados de Comprador, Bodega y Administrador están ejecutados. Producción continúa bloqueada hasta el cierre completo de OPS-01. No se han usado datos comerciales reales.