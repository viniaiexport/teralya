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
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f docs/INF/teralya_schema_v1.4_APROBADO.sql
npm run start:dev --workspace @teralya/backend
```

Antes de arrancar, cada entorno debe fijar explícitamente:

- `MINIMUM_PURCHASE_AGE`: edad mínima aplicable, validada por Legal.
- `ALCOHOL_TERMS_VERSION`: versión vigente y publicada de las condiciones de alcohol.

Los valores de `.env.example` son únicamente locales y no autorizan una configuración de producción.

## Comprobaciones

```bash
npm run backend:check
python3 scripts/validate_openapi_contract.py docs/INF/openapi/teralya-openapi-v1.0.yaml
```

La primera rebanada vertical implementa exclusivamente API-001,
`POST /auth/registro/comprador`. Los módulos reflejan las once fronteras aprobadas.
No se exponen rutas auxiliares como `/health`, `/metrics` o `/docs`.
