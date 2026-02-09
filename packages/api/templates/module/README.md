# Module Template

Copy this structure to `src/modules/<module-name>` and replace placeholders.

## Required Files

- `application/ports/<module>-repository.ts`
- `application/use-cases/index.ts`
- `domain/<module>.ts`
- `infrastructure/<adapter>-<module>-repository.ts`
- `presentation/http/schemas.ts`
- `presentation/http/routes.ts`

## Wiring Checklist

1. Instantiate repository adapter in `src/bootstrap/create-container.ts`.
2. Build use-cases from repository port.
3. Register routes in `src/app.ts` under `/api/v1`.
4. Add unit tests for use-cases and integration tests for HTTP routes.
