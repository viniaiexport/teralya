# Hetzner Cloud - plataforma activa de Teralya

Este módulo crea el nodo piloto europeo de Teralya, una red privada, una clave SSH y un firewall. HTTP y HTTPS aceptan tráfico únicamente desde las redes oficiales publicadas por Cloudflare; SSH exige una lista de IPs administrativas restringida.

## Qué crea

- Un servidor Ubuntu 24.04 con Docker, Compose, actualizaciones automáticas y Fail2ban.
- Un usuario `deployer` sin contraseña y con clave SSH.
- Una red privada `10.42.0.0/16`, preparada para separar la base de datos en el siguiente escalón.
- Backups diarios del disco local y protección contra borrado accidental.
- Un firewall que no publica PostgreSQL, Redis, Frontend ni Backend directamente.

El servidor único es una decisión temporal para el piloto. Antes de actividad comercial relevante se separará PostgreSQL en un nodo privado y se añadirá un segundo nodo de aplicación cuando las métricas lo requieran.

## Requisitos

1. Un proyecto de Hetzner Cloud.
2. Un token de lectura y escritura exportado como `TF_VAR_hcloud_token`.
3. Una clave SSH dedicada.
4. La IP pública desde la que se administrará el servidor.
5. Terraform 1.7 o posterior.

## Ejecución

```bash
cd infrastructure/hetzner
cp terraform.tfvars.example terraform.tfvars
export TF_VAR_hcloud_token='...'
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

`terraform apply` crea recursos facturables y debe ejecutarse desde una cuenta controlada por Teralya. El estado Terraform debe almacenarse cifrado y no se versiona.

Después del `apply`, usar `terraform output -raw server_ipv4` para configurar Cloudflare mediante `../cloudflare/configure-dns.sh`.

## Límites deliberados

- Terraform no recibe secretos de aplicación, Stripe, SMTP, PostgreSQL ni R2.
- La base de datos usa el disco local durante el piloto. Los backups PostgreSQL externos siguen siendo obligatorios.
- El origen depende de Cloudflare para tráfico web. La caída de Cloudflare no se resuelve abriendo el servidor a todo Internet.
- El módulo AWS anterior vive en `infrastructure/aws/` como referencia futura y no forma parte del despliegue activo.
