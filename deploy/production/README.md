# Despliegue de producción en Hetzner

Esta carpeta es la unidad desplegable del piloto. Caddy es el único servicio con puertos públicos; Frontend, Backend, PostgreSQL y Redis solo existen dentro de redes Docker.

## Preparación única

1. Crear el servidor con `infrastructure/hetzner/`.
2. Crear los buckets R2 UE de medios y backups. Usar credenciales distintas y limitadas por bucket.
3. Configurar DNS con `infrastructure/cloudflare/configure-dns.sh`.
4. Crear `.env.production` a partir del ejemplo, sin marcadores y con permisos `0600`.
5. Copiar esta carpeta a `/srv/teralya` y copiar el esquema aprobado dentro de `/srv/teralya/docs/INF/`.
6. Ejecutar `./scripts/deploy.sh`.
7. Instalar los timers con `sudo ./scripts/install-systemd.sh`.

El workflow `deploy-production.yml` automatiza las copias, el pull de imágenes y el despliegue cuando los secretos de GitHub estén configurados.

## Comprobaciones

```bash
docker compose --env-file .env.production -f compose.yaml ps
curl -fsS https://api.teralya.eu/health/ready
systemctl list-timers 'teralya-backup*'
sudo systemctl start teralya-backup.service
sudo systemctl start teralya-backup-verify.service
```

## Recuperación

No borrar el volumen PostgreSQL para probar una restauración. La prueba mensual debe hacerse en un contenedor o servidor temporal. `verify-latest-backup.sh` comprueba integridad y antigüedad cada semana; una restauración completa mensual sigue siendo una tarea operativa obligatoria.

## Siguiente escalón

Antes de actividad comercial relevante:

- mover PostgreSQL a un servidor Hetzner privado dedicado;
- activar archivado continuo WAL hacia R2 UE;
- definir RPO de 15 minutos y RTO máximo de 4 horas;
- añadir monitorización externa y alertas de backup;
- añadir un segundo nodo de aplicación y balanceador cuando la disponibilidad o el tráfico lo exijan.
