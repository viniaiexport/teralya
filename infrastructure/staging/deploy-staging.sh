#!/usr/bin/env bash
set -Eeuo pipefail

cd "${HOME}/teralya"

trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

test -s .env.staging
test -f compose.staging.yaml
test -f infrastructure/staging/Caddyfile
test -f docs/INF/teralya_schema_v1.5_APROBADO.sql
test -f database/migrations/20260717_001_cierre_web.sql

docker compose --env-file .env.staging -f compose.staging.yaml config --quiet
docker compose --env-file .env.staging -f compose.staging.yaml pull
docker compose --env-file .env.staging -f compose.staging.yaml up -d postgres redis --wait --wait-timeout 120
docker compose --env-file .env.staging -f compose.staging.yaml exec -T postgres \
  psql -U teralya -d teralya -v ON_ERROR_STOP=1 < database/migrations/20260717_001_cierre_web.sql
docker compose --env-file .env.staging -f compose.staging.yaml up -d --remove-orphans --wait --wait-timeout 180
docker image prune -f
docker compose --env-file .env.staging -f compose.staging.yaml ps
