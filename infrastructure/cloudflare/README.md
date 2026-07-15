# Cloudflare DNS, edge y R2

Cloudflare es la puerta pública de Teralya. El origen Hetzner solo acepta tráfico web desde las redes oficiales de Cloudflare.

## 1. Crear R2 dentro de la jurisdicción UE

Crear un token limitado con permiso `Workers R2 Storage Write` y ejecutar:

```bash
export CLOUDFLARE_ACCOUNT_ID='...'
export CLOUDFLARE_API_TOKEN='...'
export R2_BUCKET_NAME='teralya-production-media'
./infrastructure/cloudflare/provision-r2-eu.sh
```

El script es idempotente y se detiene si encuentra un bucket homónimo fuera de la jurisdicción UE. La aplicación debe usar:

```text
OBJECT_STORAGE_REGION=auto
OBJECT_STORAGE_ENDPOINT=https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com
OBJECT_STORAGE_FORCE_PATH_STYLE=false
```

Las credenciales S3 de R2 se crean aparte con acceso exclusivo al bucket. Nunca se incorporan a Terraform ni al repositorio.

Aplicar `r2-cors.json` desde el panel R2 o con Wrangler. Sustituir los dominios del fichero si el dominio definitivo no es `teralya.eu`.

## 2. DNS

Crear un token limitado a `Zone DNS Edit`, obtener la IPv4 de Terraform y ejecutar:

```bash
export CLOUDFLARE_ZONE_ID='...'
export CLOUDFLARE_API_TOKEN='...'
export TERALYA_DOMAIN='teralya.eu'
./infrastructure/cloudflare/configure-dns.sh 203.0.113.10
```

El script crea o actualiza los registros proxied para el dominio raíz, `www` y `api`.

## 3. Configuración obligatoria en Cloudflare

- SSL/TLS: `Full (strict)` después de que Caddy obtenga los certificados.
- Always Use HTTPS: activo.
- Minimum TLS Version: 1.2.
- Automatic HTTPS Rewrites: activo.
- WAF Managed Rules: activo si el plan contratado lo permite.
- Proteger el entorno staging con Cloudflare Access.
- Conectar `media.<dominio>` como Custom Domain del bucket R2. No crear un CNAME manual sin asociarlo al bucket.

Los hints de ubicación son solo una preferencia. Teralya usa la cabecera de jurisdicción `eu`, que es el control que garantiza residencia de los objetos en la UE.
