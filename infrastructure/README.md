# Infrastructure

## Staging reproducible

El repositorio incluye imágenes de producción para Frontend y Backend y un entorno de staging local con PostgreSQL y Redis.

1. Copiar `.env.staging.example` a `.env.staging`.
2. Sustituir todos los valores `replace-with-*`; la contraseña de PostgreSQL debe coincidir dentro de `DATABASE_URL`.
3. Ejecutar `docker compose --env-file .env.staging -f compose.staging.yaml up --build -d`.
4. Verificar `http://localhost:3001/health/ready` y `http://localhost:3000/`.

El esquema aprobado se aplica únicamente al crear por primera vez el volumen de PostgreSQL. Las variables legales y de seguridad del ejemplo son válidas solo para staging y no autorizan un despliegue de producción.

Los contenedores se ejecutan como usuarios sin privilegios, exponen comprobaciones de salud y reinician salvo parada explícita.

## AWS

La base Terraform para staging y producción se encuentra en [`terraform/`](terraform/README.md). No contiene secretos ni aplica infraestructura automáticamente.
