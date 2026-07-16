#!/usr/bin/env bash
set -Eeuo pipefail

cd "${HOME}/teralya"

test -s .env.staging
test -f compose.staging.yaml
test -f infrastructure/staging/Caddyfile
test -f docs/INF/teralya_schema_v1.4_APROBADO.sql

docker compose --env-file .env.staging -f compose.staging.yaml config --quiet
docker compose --env-file .env.staging -f compose.staging.yaml pull
docker compose --env-file .env.staging -f compose.staging.yaml up -d --remove-orphans --wait --wait-timeout 180
docker logout ghcr.io >/dev/null 2>&1 || true
docker image prune -f
docker compose --env-file .env.staging -f compose.staging.yaml ps
