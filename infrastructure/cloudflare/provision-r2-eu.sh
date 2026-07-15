#!/usr/bin/env bash
set -euo pipefail

required=(CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN R2_BUCKET_NAME)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Falta la variable $name" >&2
    exit 1
  fi
done

api="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets"
auth=(
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
  -H "Content-Type: application/json"
  -H "cf-r2-jurisdiction: eu"
)

status="$(curl --silent --show-error --output /tmp/teralya-r2-get.json --write-out '%{http_code}' "${auth[@]}" "${api}/${R2_BUCKET_NAME}")"

if [[ "$status" == "200" ]]; then
  jurisdiction="$(jq -r '.result.jurisdiction // empty' /tmp/teralya-r2-get.json)"
  if [[ "$jurisdiction" != "eu" ]]; then
    echo "El bucket existe pero no pertenece a la jurisdicción UE. No se modificará." >&2
    exit 1
  fi
  echo "R2 ya existe y su jurisdicción UE ha sido verificada: ${R2_BUCKET_NAME}"
  exit 0
fi

if [[ "$status" != "404" ]]; then
  jq . /tmp/teralya-r2-get.json >&2 || true
  echo "Cloudflare devolvió HTTP $status al consultar R2." >&2
  exit 1
fi

payload="$(jq -n --arg name "$R2_BUCKET_NAME" '{name: $name, locationHint: "weur", storageClass: "Standard"}')"
curl --fail --silent --show-error \
  "${auth[@]}" \
  --data "$payload" \
  "$api" | jq -e '.success == true and .result.jurisdiction == "eu"' >/dev/null

echo "R2 creado con jurisdicción UE: ${R2_BUCKET_NAME}"
echo "Endpoint S3: https://${CLOUDFLARE_ACCOUNT_ID}.eu.r2.cloudflarestorage.com"
