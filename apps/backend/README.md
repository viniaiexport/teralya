# Backend de Teralya

Base contract-first del monolito modular Node.js/TypeScript. El contrato normativo está en
`docs/INF/openapi/teralya-openapi-v1.0.yaml`.

## Requisitos

- Node.js 22 o superior.
- Docker con Compose.

## Desarrollo local

```bash
npm ci
docker compose up -d postgres redis
cp apps/backend/.env.example apps/backend/.env
npm run start:dev --workspace @teralya/backend
```

## Comprobaciones

```bash
npm run backend:check
python3 scripts/validate_openapi_contract.py docs/INF/openapi/teralya-openapi-v1.0.yaml
```

Este primer incremento no registra endpoints funcionales. Los módulos reflejan las once fronteras
aprobadas y las operaciones se incorporarán como rebanadas verticales, empezando por API-001.
No se exponen rutas auxiliares como `/health`, `/metrics` o `/docs`.
