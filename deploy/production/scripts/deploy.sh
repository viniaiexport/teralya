#!/usr/bin/env bash
set -euo pipefail

root="${TERALYA_ROOT:-/srv/teralya}"
cd "$root"

if [[ ! -f .env.production ]]; then
  echo "No existe $root/.env.production" >&2
  exit 1
fi

if grep -Eq 'replace-with|REPLACE_WITH' .env.production; then
  echo "El fichero de producción todavía contiene marcadores replace-with." >&2
  exit 1
fi

chmod 600 .env.production

docker compose --env-file .env.production -f compose.yaml config --quiet
docker compose --env-file .env.production -f compose.yaml pull
docker compose --env-file .env.production -f compose.yaml up -d --remove-orphans

services=(postgres redis backend frontend caddy)
deadline=$((SECONDS + 180))

for service in "${services[@]}"; do
  container_id="$(docker compose --env-file .env.production -f compose.yaml ps -q "$service")"
  if [[ -z "$container_id" ]]; then
    echo "No se ha creado el contenedor $service" >&2
    exit 1
  fi

  while true; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")"
    if [[ "$status" == "healthy" || "$status" == "running" ]]; then
      break
    fi
    if [[ "$status" == "unhealthy" || "$status" == "exited" || "$SECONDS" -ge "$deadline" ]]; then
      docker compose --env-file .env.production -f compose.yaml logs --tail=100 "$service" >&2
      echo "$service no alcanzó un estado saludable: $status" >&2
      exit 1
    fi
    sleep 3
  done
done

docker image prune --force --filter 'until=168h' >/dev/null
echo "Despliegue saludable: $(date --utc +%FT%TZ)"
