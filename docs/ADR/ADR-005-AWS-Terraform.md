# ADR-005 — AWS y Terraform para la infraestructura del MVP

**Estado:** Sustituido por ADR-006 para el MVP activo
**Fecha:** 15/07/2026
**Decide:** CTO con autorización expresa del CEO
**Decisión relacionada:** DLOG 0023

> Nota del 15/07/2026: ADR-006 y DLOG 0026 sustituyen esta decisión para la plataforma activa. La implementación AWS se conserva únicamente como destino futuro de migración.

## Contexto

INF-07 permitía AWS o GCP, pero la implementación ya utiliza almacenamiento compatible con S3 y el MVP necesita entornos reproducibles, privados y operables sin mantener dos alternativas cloud.

## Decisión

AWS será el proveedor único del MVP y Terraform la fuente de verdad de infraestructura.

- ECS Fargate ejecuta el Frontend Next.js y el Backend NestJS como servicios separados.
- Las tareas se ubican en subredes privadas y reciben tráfico únicamente desde un Application Load Balancer.
- RDS PostgreSQL 16 y ElastiCache Redis permanecen privados y cifrados.
- S3 conserva las imágenes con bloqueo público; CloudFront usa acceso privado al origen.
- Secrets Manager suministra secretos a las tareas sin versionarlos ni incorporarlos al estado Terraform.
- GitHub Actions utiliza OIDC y roles temporales; no se admiten access keys persistentes.
- Staging reduce capacidad y retención para controlar coste. Producción exige alta disponibilidad, aprobación manual y cierre de los bloqueos de `docs/INDEX.md`.

## Consecuencias

Se elimina la alternativa GCP del MVP. El equipo mantiene una sola implementación y una sola disciplina operativa. La aplicación conserva contratos portables —PostgreSQL, Redis y S3—, pero migrar de proveedor requeriría un nuevo ADR y una nueva implementación IaC.

Terraform listo no autoriza producción: edad mínima, términos de alcohol, límites de seguridad, secretos, Stripe, SMTP y política de falta de stock siguen siendo gates independientes.
