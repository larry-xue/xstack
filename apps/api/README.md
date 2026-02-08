# API (Elysia)

## Scripts

- `pnpm -C apps/api dev` ¨C start TypeScript watch + Node --watch
- `pnpm -C apps/api start` ¨C build and run production server
- `pnpm -C apps/api test` ¨C run tests

## Endpoints

- `GET /` returns `{ service: "api", status: "ok" }`
- `GET /health` returns `{ ok: true }`
