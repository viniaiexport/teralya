# Backend de Teralya

Monolito modular Node.js/TypeScript desarrollado contract-first. El contrato normativo está en
`docs/INF/openapi/teralya-openapi-v1.0.yaml`.

## Requisitos

- Node.js 22 o superior.
- Docker con Compose.

## Desarrollo local

```bash
npm ci
docker compose up -d postgres redis
cp apps/backend/.env.example apps/backend/.env
set -a
. apps/backend/.env
set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f docs/INF/teralya_schema_v1.4_APROBADO.sql
npm run start:dev --workspace @teralya/backend
```

Antes de arrancar, cada entorno debe fijar explícitamente:

- `MINIMUM_PURCHASE_AGE`: edad mínima aplicable. Fijada en 18 por decisión del CEO (Decision Log 0023, docs/LEGAL/LEGAL-01 §1); válida para todos los entornos.
- `ALCOHOL_TERMS_VERSION`: versión vigente y publicada de las condiciones de alcohol (docs/LEGAL/LEGAL-06). Cambiarla solo junto con una nueva versión de ese documento.

Los valores de `.env.example` reflejan la decisión vigente y son válidos también en producción para estas dos variables; el resto (secretos, SMTP, Stripe, almacenamiento) sigue siendo únicamente local y no autoriza una configuración de producción.

## Comprobaciones

```bash
npm run backend:check
python3 scripts/validate_openapi_contract.py docs/INF/openapi/teralya-openapi-v1.0.yaml
```

Las rutas operativas no forman parte del contrato de negocio OpenAPI:

- `GET /health/live` confirma que el proceso HTTP responde, sin consultar dependencias.
- `GET /health/ready` responde `200` únicamente cuando PostgreSQL y Redis están disponibles;
  si alguna comprobación falla o supera 1,5 segundos, responde `503` sin exponer credenciales.

No se exponen todavía rutas auxiliares de métricas o documentación interactiva.
