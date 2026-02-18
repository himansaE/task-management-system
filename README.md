# Task Management System (Assessment)

Associate Software Engineer assessment.

## Stack

- Frontend (planned / deferred in current phase): Next.js (App Router), Tailwind CSS, shadcn/ui, TanStack Query, Axios
- Backend: NestJS (Express), Drizzle ORM
- Database: PostgreSQL (Supabase)
- Monorepo: Turborepo + pnpm

## Repository Layout (Blueprint)

- `apps/web` — Next.js frontend
- `apps/api` — NestJS backend
- `packages/contract` — shared Zod schemas/types
- `packages/database` — Drizzle schema and migrations

## Local Setup

1. Install dependencies:
   - `pnpm install`
2. Create environment file:
   - copy `.env.example` to `.env`
   - set `DATABASE_URL` (for managed DB, use the provider host/user/password)
3. Generate and run migrations:
   - `pnpm run db:generate`
   - `pnpm run db:migrate`
4. Start development:
   - `pnpm dev`

## Database Commands

- `pnpm run db:generate` — generate SQL migration from Drizzle schema
- `pnpm run db:migrate` — apply pending migrations
- `pnpm run db:studio` — open Drizzle Studio

## API Health Endpoint

- `GET /health/db` — checks DB connectivity and returns:
   - `200 {"data":{"status":"ok"}}` when database is reachable
   - `503 {"statusCode":503,"error":"Service Unavailable","message":"Database unavailable","timestamp":"<ISO>"}` when database is unavailable

## Current Implementation Status (February 2026)

- Backend is implemented for auth + task CRUD with secure cookie auth, token versioning, and ownership checks.
- API success responses use a standardized envelope: `{"data": ...}` and list endpoints include `meta`.
- `GET /tasks` supports `status`, `priority`, `page`, and `limit` query parameters.
- Frontend in `apps/web` is deferred for the current phase and remains scaffold-level.

## API Documentation

- Swagger UI is available at `GET /api/docs`

## CI/CD Status (Current vs Planned)


- Current state: no root GitHub Actions workflow is committed yet.
- Planned: quality gates (`lint`, `check-types`, `build`) on PRs and main.
- Planned deployment: Vercel for frontend and Render deploy hook for backend after quality passes.

Why this default:
- friendly on forks
- Minimal secret setup

### Upgrade Path (Option B: Strict Orchestration)

- Move frontend deploy into GitHub Actions.
- Gate deployment with secret checks so forks do not fail:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `RENDER_DEPLOY_HOOK`

## Reviewer Notes

- CI/deploy workflow is documented as the target approach and can be added when deployment automation is enabled.

## Security Highlights

- JWT in `HttpOnly` + `Secure` + `SameSite=Strict` cookies
- Token versioning for immediate session revocation
- Argon2id password hashing
- Global validation/sanitization via Zod + pipes
- Rate limiting + secure headers (Helmet)

## Deliverables Reference

- Planning: [PLAN.md](PLAN.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

## Assessment Traceability

### Phase 1 — Planning
- Backend choice and justification: [PLAN.md](PLAN.md)
- Architecture and security planning: [PLAN.md](PLAN.md), [ARCHITECTURE.md](ARCHITECTURE.md)

### Phase 2 — Implementation & Deployment 
- Frontend: deferred in current phase (planned: login/register, dashboard, task create/edit, loading/error states, route protection)
- Backend endpoints:
   - `POST /auth/register`
   - `POST /auth/login`
   - `POST /auth/refresh`
   - `POST /auth/logout`
   - `POST /auth/revoke`
   - `GET /tasks`
   - `POST /tasks`
   - `PUT /tasks/:id`
   - `DELETE /tasks/:id`
- Security: secure token storage, password hashing, rate limiting, validation/sanitization, authorization by ownership, safe error handling
- Deployment: backend + database active; frontend and CI automation follow the frontend/deployment phase

### Phase 3 — Review
- Explain architecture decisions, trade-offs, and scaling considerations
- Demonstrate live deployment and key security decisions
- Walk through code organization and ownership boundaries
