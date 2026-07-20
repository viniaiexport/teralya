#!/usr/bin/env bash
set -Eeuo pipefail

exec 9>"${HOME}/teralya/.reconcile-staging.lock"
flock -n 9 || exit 0

cd "${HOME}/teralya"

frontend_image="ghcr.io/viniaiexport/teralya-frontend:staging"
backend_image="ghcr.io/viniaiexport/teralya-backend:staging"

image_id() {
  docker image inspect --format '{{.Id}}' "$1" 2>/dev/null || true
}

frontend_before="$(image_id "$frontend_image")"
backend_before="$(image_id "$backend_image")"

docker pull --quiet "$frontend_image" >/dev/null
docker pull --quiet "$backend_image" >/dev/null

frontend_after="$(image_id "$frontend_image")"
backend_after="$(image_id "$backend_image")"

if [[ "$frontend_before" == "$frontend_after" && "$backend_before" == "$backend_after" ]]; then
  exit 0
fi

"${HOME}/teralya/deploy-staging.sh"
