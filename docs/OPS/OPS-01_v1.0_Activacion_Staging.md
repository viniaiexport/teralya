# OPS-01 — Activación y validación de staging

**Teralya · Versión 1.0 · 17/07/2026 · Estado: EN EJECUCIÓN**

## Objetivo

Convertir la base de staging ya integrada en un entorno operativo verificable, sin utilizar secretos ficticios y sin activar producción antes de superar todos los gates.

## Dependencias externas obligatorias

- Environment de GitHub `staging`.
- `STAGING_DEPLOY_ENABLED=true` únicamente cuando el resto esté listo.
- Acceso SSH al servidor Hetzner reconciliado con `infrastructure/hetzner`.
- Firewall TCP 80/443 limitado a las redes oficiales de Cloudflare.
- Bucket Cloudflare R2 con jurisdicción `eu` y credenciales S3 compatibles.
- DNS y TLS para `staging.teralya.eu`.
- Stripe en modo prueba y secreto de webhook.
- SMTP operativo para recuperación y cancelación.
- Variables de seguridad aprobadas.

## Secuencia

1. Reconciliar el servidor existente con Terraform sin destruir recursos válidos.
2. Aplicar firewall y DNS Cloudflare.
3. Provisionar y verificar R2 UE.
4. Cargar `STAGING_ENV_FILE` y secretos SSH en GitHub.
5. Mantener `ALCOHOL_TERMS_VERSION=LEGAL-06-v1.0`.
6. Activar `STAGING_DEPLOY_ENABLED`.
7. Ejecutar el workflow de staging.
8. Verificar migración PostgreSQL v1.5, readiness de Backend y salud del Frontend.
9. Ejecutar recorridos E2E de visitante, Comprador, Bodega y Administrador.
10. Validar registro, login, recuperación, carrito, checkout Stripe, webhook, Pedido, cancelación, stock, condiciones de envío e imágenes.
11. Ejecutar pruebas de rendimiento, seguridad y restauración de backup.
12. Registrar evidencias y defectos; producción permanece bloqueada mientras exista un fallo crítico.

## Gates de salida

- CI de Backend, Frontend, OpenAPI e Infraestructura en verde.
- Cero vulnerabilidades altas o críticas conocidas en dependencias de producción.
- HTTPS válido y origen no accesible fuera de Cloudflare, salvo SSH restringido.
- PostgreSQL y Redis sin puertos públicos.
- Reembolso de prueba idempotente y stock restituido una sola vez.
- Copia de seguridad creada y restauración ensayada.
- Límites de autenticación aprobados por Seguridad.
- Política operativa ante cobro confirmado sin stock aprobada por el CEO.
- Revisión legal/fiscal externa completada antes de operación multi-país a escala.

## Estado actual

El código, Compose, Caddy, GHCR, migración y workflows están preparados. La ejecución real continúa bloqueada hasta que las credenciales externas estén cargadas y verificadas.
