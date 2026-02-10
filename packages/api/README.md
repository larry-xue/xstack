# API (Elysia, Modular Monolith)

## Scripts

- `pnpm -C packages/api dev` - run server from TypeScript with auto-reload
- `pnpm -C packages/api build` - bundle server to `dist/` (ESM)
- `pnpm -C packages/api start` - build and run production server
- `pnpm -C packages/api test` - run unit/integration/contract tests
- `pnpm -C packages/api prisma migrate deploy` - apply Prisma migrations

## API Surface

- `GET /` system status
- `GET /health` liveness probe
- `GET /api/v1/todos` requires `Authorization: Bearer <token>`
- `POST /api/v1/todos` requires `Authorization: Bearer <token>`
- `PATCH /api/v1/todos/:id` requires `Authorization: Bearer <token>`
- `DELETE /api/v1/todos/:id` requires `Authorization: Bearer <token>`
- `GET /openapi/json` OpenAPI schema (runtime docs/debug endpoint)

## Response Contract

Successful responses:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Message",
    "requestId": "uuid",
    "details": {}
  }
}
```

Every response includes `x-request-id`.

## Architecture

- `src/bootstrap/create-container.ts` composition root and dependency wiring
- `src/core/config/*` environment loading and fail-fast validation
- `src/core/http/*` envelopes, error model, request context model
- `src/core/plugins/*` request-id injection, auth guard, centralized error mapping
- `src/modules/auth/*` auth provider port + Supabase adapter
- `src/modules/tasks/*` vertical slice:
  - `application` use-cases and ports
  - `domain` entities and mappers
  - `infrastructure` Prisma repository adapter
  - `presentation/http` route handlers and request/response schemas

## Environment

Set these in `packages/api/.env.local`:

- `DATABASE_URL`
- `DATABASE_URL_TEST` (for tests)
- `SUPABASE_JWT_SECRET`
- Optional: `SUPABASE_JWT_ISS`, `SUPABASE_JWKS_URL`, `PORT`

## Module Scaffold Convention

Use `packages/api/templates/module` as the baseline when adding a new module.

Target structure:

- `src/modules/<module>/application/ports`
- `src/modules/<module>/application/use-cases`
- `src/modules/<module>/domain`
- `src/modules/<module>/infrastructure`
- `src/modules/<module>/presentation/http`

Required steps for a new module:

1. Define domain model and repository port.
2. Implement use-cases against ports.
3. Add infrastructure adapter (Prisma, external service, etc.).
4. Add HTTP schemas + routes.
5. Wire module in `src/bootstrap/create-container.ts` and `src/app.ts`.
6. Add unit + integration tests.
