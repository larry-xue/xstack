# API (Elysia)

## Scripts

- `pnpm -C packages/api dev` - build + watch + run server with auto-restart
- `pnpm -C packages/api start` - build and run production server
- `pnpm -C packages/api test` - run API tests
- `pnpm -C packages/api prisma migrate deploy` - apply Prisma migrations

## Endpoints

- `GET /` returns `{ service: "api", status: "ok" }`
- `GET /health` returns `{ ok: true }`
- `GET /api/todos` requires `Authorization: Bearer <token>`
- `POST /api/todos` requires `Authorization: Bearer <token>`
