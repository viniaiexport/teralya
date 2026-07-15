# Terraform AWS - referencia futura de Teralya

> Estado: no activo. ADR-006 sustituyó ADR-005 para el MVP. Este módulo se conserva como referencia de migración cuando las métricas o la subvención CAM justifiquen AWS.

Base común para `staging` y `production`: VPC en dos AZ, dos NAT Gateway, ALB HTTPS, ECS Fargate privado, ECR inmutable, RDS PostgreSQL 16, Redis Multi-AZ cifrado, S3 privado y CloudFront con OAC.

## Uso seguro

1. Configurar un backend remoto S3 con bloqueo (fuera de este módulo) y credenciales AWS por OIDC/SSO.
2. Copiar `terraform.tfvars.example` a un fichero no versionado y usar imágenes fijadas por digest.
3. Ejecutar `terraform init`, `terraform fmt -check`, `terraform validate` y revisar `terraform plan`.
4. Crear una versión JSON del secreto indicado por `backend_secret_arn` con las claves de `local.backend_secret_keys`. Terraform crea únicamente el contenedor: nunca guarda los valores.
5. Construir `DATABASE_URL` usando el secreto administrado por RDS (`rds_master_secret_arn`) y el endpoint de salida. Añadir también las variables operativas no sensibles exigidas por `apps/backend/src/config/environment.ts` antes de arrancar el servicio.

El hostname `api_hostname` debe apuntar al ALB. El hostname web también debe apuntar al mismo ALB y queda atendido por la acción por defecto del frontend. CloudFront usa su dominio gestionado; añadir alias y certificado ACM de `us-east-1` cuando exista el dominio definitivo.

## Decisiones y límites

- No ejecuta `apply`, no crea zonas DNS y no introduce secretos.
- Dos NAT Gateway dan aislamiento por AZ pero tienen coste fijo; staging puede reducirse explícitamente en una iteración de optimización.
- `deletion_protection` está activa por defecto para ALB y RDS.
- La versión inicial no configura WAF, alarmas, autoscaling ni backup cross-region; son controles posteriores a cerrar antes del go-live de producción.
