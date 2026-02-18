# API (NestJS)

Backend service for auth and task management.

## Prerequisites

- Install workspace dependencies from repo root: `pnpm install`
- Set `DATABASE_URL` in root `.env`
- Run migrations from repo root: `pnpm run db:migrate`

## Local Development

Run from repo root:

- `pnpm --filter api run dev`

## Build and Start

Run from repo root:

- `pnpm --filter api run build`
- `pnpm --filter api run start:prod`

## Quality Checks

Run from repo root:

- `pnpm --filter api run lint`
- `pnpm --filter api run check-types`

## Health

- `GET /health/db` returns `{"data":{"status":"ok"}}` when database connectivity works.
- On failure, returns HTTP `503` with the standard error envelope: `{"statusCode":503,"error":"Service Unavailable","message":"Database unavailable","timestamp":"<ISO>"}`.

## API Docs

- Swagger UI: `GET /api/docs`
