#!/usr/bin/env bash
set -euo pipefail

root="${TERALYA_ROOT:-/srv/teralya}"
cd "$root"
set -a
# shellcheck disable=SC1091
source .env.production
set +a

required=(R2_BACKUP_BUCKET R2_BACKUP_ENDPOINT R2_BACKUP_ACCESS_KEY_ID R2_BACKUP_SECRET_ACCESS_KEY)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Falta $name para ejecutar el backup" >&2
    exit 1
  fi
done

umask 077
backup_dir="$root/backups"
timestamp="$(date --utc +%Y%m%dT%H%M%SZ)"
filename="teralya-postgres-${timestamp}.dump"
path="$backup_dir/$filename"
mkdir -p "$backup_dir"

docker compose --env-file .env.production -f compose.yaml exec -T postgres \
  pg_dump --username teralya --dbname teralya --format custom --compress 9 >"$path"

docker run --rm \
  --volume "$backup_dir:/backups:ro" \
  rclone/rclone:1.70.3 \
  copyto "/backups/$filename" ":s3:${R2_BACKUP_BUCKET}/postgres/${filename}" \
  --s3-provider Cloudflare \
  --s3-access-key-id "$R2_BACKUP_ACCESS_KEY_ID" \
  --s3-secret-access-key "$R2_BACKUP_SECRET_ACCESS_KEY" \
  --s3-endpoint "$R2_BACKUP_ENDPOINT" \
  --s3-no-check-bucket

sha256sum "$path" >"${path}.sha256"
find "$backup_dir" -type f -mtime +7 -delete
echo "Backup PostgreSQL subido y verificado localmente: $filename"
