#!/usr/bin/env bash
set -euo pipefail

root="${TERALYA_ROOT:-/srv/teralya}"
backup="$(find "$root/backups" -maxdepth 1 -type f -name 'teralya-postgres-*.dump' -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)"

if [[ -z "$backup" ]]; then
  echo "No existe ningún backup local para verificar." >&2
  exit 1
fi

if [[ -f "${backup}.sha256" ]]; then
  sha256sum --check "${backup}.sha256"
fi

docker run --rm --network none \
  --volume "$backup:/backup.dump:ro" \
  postgres:16-alpine \
  pg_restore --list /backup.dump >/dev/null

age_seconds=$(( $(date +%s) - $(stat -c %Y "$backup") ))
if (( age_seconds > 129600 )); then
  echo "El backup más reciente supera las 36 horas." >&2
  exit 1
fi

echo "Archivo PostgreSQL legible y reciente: $(basename "$backup")"
