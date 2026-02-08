# API (Elysia)

## Scripts

- `pnpm -C packages/api dev` - run server from TypeScript with auto-reload
- `pnpm -C packages/api build` - bundle server to `dist/` (ESM)
- `pnpm -C packages/api start` - build and run production server
- `pnpm -C packages/api test` - run API tests
- `pnpm -C packages/api prisma migrate deploy` - apply Prisma migrations

## Endpoints

- `GET /` returns `{ service: "api", status: "ok" }`
- `GET /health` returns `{ ok: true }`
- `GET /api/todos` requires `Authorization: Bearer <token>`
- `POST /api/todos` requires `Authorization: Bearer <token>`
- `PATCH /api/todos/:id` requires `Authorization: Bearer <token>`
- `DELETE /api/todos/:id` requires `Authorization: Bearer <token>`

## Structure

- `src/routes/root.ts` for base routes
- `src/plugins/auth.ts` for auth derivation + guard
- `src/plugins/error.ts` for unified error handling
- `src/plugins/request-context.ts` for requestId + request logging
- `src/schemas/error.ts` for error codes and error response schema
- `src/modules/todos/*` for schema, repo, service, routes

## Testing

Set `DATABASE_URL_TEST` in `packages/api/.env.local` to point at a separate test database.

Run:

- `pnpm -C packages/api test`

## Error Response

All error responses follow:

```json
{
  "error": "Message",
  "code": "ERROR_CODE",
  "requestId": "uuid"
}
```

Every response also includes `x-request-id` header. Clients may pass their own `x-request-id` to correlate logs.
