#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: $0 <IPV4_HETZNER>" >&2
  exit 1
fi

origin_ipv4="$1"
required=(CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN TERALYA_DOMAIN)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Falta la variable $name" >&2
    exit 1
  fi
done

api="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records"
auth=(
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
  -H "Content-Type: application/json"
)

upsert_a_record() {
  local hostname="$1"
  local lookup record_id payload

  lookup="$(curl --fail --silent --show-error --get "${auth[@]}" --data-urlencode "type=A" --data-urlencode "name=${hostname}" "$api")"
  record_id="$(jq -r '.result[0].id // empty' <<<"$lookup")"
  payload="$(jq -n --arg type A --arg name "$hostname" --arg content "$origin_ipv4" '{type: $type, name: $name, content: $content, ttl: 1, proxied: true}')"

  if [[ -n "$record_id" ]]; then
    curl --fail --silent --show-error --request PUT "${auth[@]}" --data "$payload" "${api}/${record_id}" | jq -e '.success == true' >/dev/null
    echo "Actualizado: ${hostname}"
  else
    curl --fail --silent --show-error --request POST "${auth[@]}" --data "$payload" "$api" | jq -e '.success == true' >/dev/null
    echo "Creado: ${hostname}"
  fi
}

upsert_a_record "$TERALYA_DOMAIN"
upsert_a_record "www.${TERALYA_DOMAIN}"
upsert_a_record "api.${TERALYA_DOMAIN}"

echo "DNS proxied preparado. Configurar SSL/TLS en Full (strict) cuando Caddy haya emitido el certificado del origen."
