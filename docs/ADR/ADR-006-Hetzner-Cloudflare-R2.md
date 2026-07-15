# ADR-006 - Hetzner, Cloudflare y R2 para la infraestructura del MVP

**Estado:** Aceptado
**Fecha:** 15/07/2026
**Decide:** CEO, con recomendación técnica del CTO
**Decisión relacionada:** DLOG 0026
**Sustituye:** ADR-005 para la plataforma activa del MVP

## Contexto

La base AWS aprobada en ADR-005 ofrece alta disponibilidad y numerosos servicios administrados, pero introduce costes fijos y complejidad operativa antes de que Teralya tenga tráfico que los justifique. La aplicación ya usa contratos portables: contenedores Docker, PostgreSQL, Redis y almacenamiento compatible con S3.

Lovable ha servido como herramienta de apoyo visual, pero el repositorio no mantiene una dependencia de ejecución con Lovable, Supabase, Vercel o Netlify. GitHub puede seguir siendo la fuente de verdad y la aplicación puede desplegarse en cualquier proveedor compatible con contenedores.

## Decisión

La plataforma activa del MVP será:

- **Hetzner Cloud** para ejecutar Frontend, Backend, PostgreSQL y Redis durante el piloto.
- **Cloudflare** para DNS, proxy, TLS, CDN y controles de borde.
- **Cloudflare R2 bajo jurisdicción `eu`** para imágenes y otros objetos.
- **GitHub Actions y GHCR** para construir imágenes inmutables y desplegarlas.
- **Terraform** para la infraestructura Hetzner; los secretos nunca entran en el estado.

El piloto puede comenzar en un solo nodo para controlar costes. PostgreSQL y Redis no publican puertos. El nodo acepta tráfico web exclusivamente desde Cloudflare y SSH únicamente desde redes administrativas expresamente autorizadas.

Lovable queda fuera de la ruta crítica de producción. Puede utilizarse para explorar diseños, pero no controla código, DNS, datos, secretos ni despliegues.

## Seguridad y recuperación

- El bucket de medios usa la jurisdicción R2 `eu`, no un simple location hint.
- Los backups PostgreSQL se envían a un bucket R2 UE independiente y se comprueban automáticamente.
- Los backups diarios del servidor Hetzner son una segunda capa, no la única copia.
- PostgreSQL, Redis, Frontend y Backend permanecen en redes privadas Docker.
- Caddy termina TLS en el origen y Cloudflare opera en modo `Full (strict)`.
- Los tokens de Hetzner, Cloudflare, R2 y los secretos de aplicación se limitan por función y se almacenan fuera del repositorio.

## Escalado

Antes de actividad comercial relevante, PostgreSQL se separará en un nodo privado y se activará archivado WAL continuo. Después se podrán añadir nodos de aplicación y un balanceador sin modificar el contrato de la aplicación.

AWS se conserva como destino futuro. La migración se evaluará por disponibilidad requerida, RPO/RTO, coste operativo humano, exigencias empresariales, escala real o subvención CAM. No se activará por un número aislado de usuarios.

## Consecuencias

Teralya reduce coste y complejidad inicial sin renunciar a portabilidad. A cambio, asume más responsabilidad operativa sobre PostgreSQL que con RDS. Esa responsabilidad exige backups externos, pruebas de restauración, monitorización y separación progresiva de datos.

La infraestructura AWS de ADR-005 se conserva en `infrastructure/aws/` como referencia de migración, pero no se despliega ni forma parte de la ruta activa del MVP.
