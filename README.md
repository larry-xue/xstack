# XStack

XStack is a pnpm + Turborepo monorepo with a React workspace app and an Elysia API.

It ships a complete authenticated task workflow:

- Supabase auth in the frontend
- JWT verification in the API
- Postgres persistence via Prisma
- Typed client calls from app -> API
- Unit/integration/contract tests and Playwright e2e coverage

## Monorepo Layout

| Path                   | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `apps/app`             | React 19 + Vite frontend (Mantine UI, TanStack Router, React Query, i18n) |
| `packages/api`         | Elysia API (modular monolith), Prisma persistence, OpenAPI exposure       |
| `packages/api-client`  | Shared typed API client + error normalization                             |
| `packages/config`      | Shared TypeScript base config                                             |
| `supabase`             | Local Supabase CLI config                                                 |
| `playwright.config.ts` | End-to-end test config (starts API + app web servers)                     |

## Architecture Overview

### Frontend (`apps/app`)

- React + Vite + TypeScript
- Route-level auth guards with TanStack Router
- Supabase auth session management
- React Query with centralized error pipeline and toast deduplication
- Workspace shell with command palette, responsive sidebar, language/theme toggles
- Task page supports create/list/update/delete, pagination, sorting, and status filters

### Backend (`packages/api`)

- Elysia app composition rooted at `packages/api/src/app.ts`
- Modular monolith slice pattern:
  - `core/*`: runtime config, request context, error and envelope model, plugins
  - `modules/auth/*`: auth provider port + Supabase/JWT adapter
  - `modules/tasks/*`: domain, use-cases, repository port + Prisma adapter, HTTP routes
  - `modules/system/*`: status/health endpoints
- Dependency wiring in `packages/api/src/bootstrap/create-container.ts`
- Consistent response envelopes and `x-request-id` propagation
- OpenAPI served at `/openapi` and `/openapi/json`

### Data Model

Prisma schema currently includes a `Todo` model (`todos` table):

- `id` (UUID, PK)
- `user_id` (tenant/user scope)
- `title`
- `is_done`
- `created_at`, `updated_at`
- index on `user_id`

## Prerequisites

- Node.js (Node 20+ recommended; local dev currently uses Node `v22.15.1`)
- `pnpm` (workspace uses `pnpm@10.6.5`)
- Postgres database
- Supabase project (local CLI stack or hosted project) for auth/JWT

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment files

Create `apps/app/.env.local`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Create `packages/api/.env.local`:

```bash
DATABASE_URL=postgresql://...
DATABASE_URL_TEST=postgresql://...
SUPABASE_JWT_SECRET=...
SUPABASE_JWT_ISS=...
# optional
SUPABASE_JWKS_URL=
PORT=54545
```

Notes:

- API runtime requires `DATABASE_URL` and `SUPABASE_JWT_SECRET`.
- `DATABASE_URL_TEST` is used by API tests (`test/setup.ts` overrides `DATABASE_URL` with it).
- `SUPABASE_JWT_ISS` is optional but recommended for stricter token validation.
- `SUPABASE_JWKS_URL` is optional and used for non-HS JWT algorithms.

### 3. Apply database migrations

```bash
pnpm -C packages/api prisma migrate deploy
```

### 4. Start the app + API together

```bash
pnpm dev
```

Default local URLs:

- Frontend: `http://127.0.0.1:8878`
- API health: `http://127.0.0.1:54545/health`
- API OpenAPI JSON: `http://127.0.0.1:54545/openapi/json`

## Local Supabase (Optional)

A Supabase CLI config exists under `supabase/config.toml`.

Start local services:

```bash
pnpm supabase start
```

Useful defaults from config:

- API: `http://127.0.0.1:54321`
- DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`

Use local Supabase output (for URL/keys/JWT settings) to populate `.env.local` files.

## Workspace Scripts

### Root (`package.json`)

| Command                  | What it does                                 |
| ------------------------ | -------------------------------------------- |
| `pnpm dev`               | Run workspace dev tasks via Turbo            |
| `pnpm build`             | Build all packages/apps with `build` scripts |
| `pnpm test`              | Run workspace `test` tasks via Turbo         |
| `pnpm test:e2e`          | Run Playwright e2e tests                     |
| `pnpm test:e2e:chromium` | Run Playwright only on Chromium              |
| `pnpm test:e2e:ui`       | Open Playwright UI mode                      |
| `pnpm lint`              | Run Oxlint across workspace                  |
| `pnpm lint:fix`          | Auto-fix lint issues where possible          |
| `pnpm fmt`               | Format with OXC formatter                    |
| `pnpm fmt:check`         | Check formatting without writing             |
| `pnpm typecheck`         | Run workspace type checks                    |

### Package-scoped examples

```bash
pnpm -C packages/api dev
pnpm -C packages/api test
pnpm -C packages/api build
pnpm -C apps/app dev
pnpm -C apps/app build
```

## API Surface

### System routes

- `GET /` -> service status
- `GET /health` -> liveness

### Authenticated task routes (under `/api/v1`)

All routes below require `Authorization: Bearer <access_token>`:

- `GET /api/v1/todos`
- `POST /api/v1/todos`
- `PATCH /api/v1/todos/:id`
- `DELETE /api/v1/todos/:id`

Query options for `GET /api/v1/todos`:

- `page` (>= 1)
- `pageSize` (1-100)
- `sortBy` (`createdAt` | `updatedAt` | `title`)
- `sortOrder` (`asc` | `desc`)
- `status` (`all` | `todo` | `done`)

### Response contract

Success envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Error envelope:

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

Every response includes `x-request-id` header.

## Testing

### API tests (`packages/api`)

Covers:

- health/system endpoints
- OpenAPI contract exposure
- auth guard behavior
- full todo CRUD and envelope contracts
- pagination/sorting/filtering
- tenant boundary behavior
- task use-case unit tests

Run:

```bash
pnpm -C packages/api test
```

Requirements:

- reachable test database (`DATABASE_URL_TEST`)
- `SUPABASE_JWT_SECRET` configured for signed test JWT creation

### End-to-end tests (`apps/app/tests/e2e`)

Covers:

- auth entry flow and redirects
- sign-up/sign-in flow
- task CRUD interactions in UI
- language/theme persistence
- command palette behavior
- mobile navigation drawer
- global toast handling for API/auth failures

Run:

```bash
pnpm test:e2e
```

Notes:

- Playwright config auto-starts API (`packages/api`) and app (`apps/app`) dev servers.
- You still need working env configuration (Supabase + DB) before e2e tests.

## Error and Observability Conventions

- API maps framework/domain/db failures to normalized error envelopes.
- API error codes include:
  - `AUTH_MISSING_TOKEN`
  - `AUTH_INVALID_TOKEN`
  - `TASK_NOT_FOUND`
  - `VALIDATION_ERROR`
  - `PARSE_ERROR`
  - `ROUTE_NOT_FOUND`
  - `DATABASE_UNAVAILABLE`
  - `DATABASE_ERROR`
  - `INTERNAL_ERROR`
- Frontend maps API error codes to localized user-facing toasts.
- Unauthorized responses trigger coordinated sign-out + redirect to `/auth`.

## Adding a New Backend Module

Use `packages/api/templates/module` as the starting pattern.

Checklist:

1. Define domain model and repository port.
2. Implement use-cases against the port.
3. Add infrastructure adapter.
4. Add HTTP schemas/routes.
5. Wire dependencies in `create-container.ts` and route registration in `app.ts`.
6. Add unit + integration tests.

## Troubleshooting

### `Missing required environment variables: ...`

The API loads `.env.local` then `.env` in `packages/api` and fails fast when required values are missing.

### `AUTH_INVALID_TOKEN` from API

Usually means JWT settings are mismatched:

- check `SUPABASE_JWT_SECRET`
- check `SUPABASE_JWT_ISS`
- if using asymmetric tokens, set `SUPABASE_JWKS_URL` (or ensure issuer JWKS endpoint is reachable)

### `DATABASE_UNAVAILABLE` / `P1001`

Confirm your Postgres instance is running and `DATABASE_URL` is reachable from `packages/api`.

### Frontend cannot reach API in local dev

The app proxies `/api` and `/health` to `http://localhost:54545` via Vite config. Ensure API dev server is up on port `54545`.

## Additional Notes

- Existing package-specific docs:
  - `packages/api/README.md`
  - `apps/app/README.md` (currently default Vite template text)
- Secrets are intentionally gitignored (`.env`, `.env.*`).
