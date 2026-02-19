# Task Management System 

## Stack

- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui, TanStack Query, Axios
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
   - set env variables in `.env`
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

- Backend is implemented for auth + task CRUD with secure cookie auth, session records, and ownership checks.
- API success responses use a standardized envelope: `{"data": ...}` and list endpoints include `meta`.
- `GET /tasks` supports `status`, `priority`, `page`, and `limit` query parameters.
- Frontend in `apps/web` includes login/register pages, protected routes, task CRUD UI, auth bootstrap, automatic token refresh, and network error recovery.

## Deployment Guide

### 1. Database (Supabase)
- Create a new project on Supabase.
- Get the connection string (Transaction Mode for IPv4, or Session Mode) -> `DATABASE_URL`.
- Run migrations locally or via CI:
  ```bash
  pnpm run db:migrate
  ```

### 2. Backend (Render)
- Create a new **Web Service** on Render.
- Connect your GitHub repository.
- **Root Directory**: `.` (leave empty).
- **Runtime**: `Docker`.
- **Dockerfile Path**: `apps/api/Dockerfile`.
- **Environment Variables**:
  - `DATABASE_URL`: from Supabase
  - `JWT_ACCESS_SECRET`: generate a strong secret
  - `JWT_REFRESH_SECRET`: generate a strong secret
  - `CORS_ORIGIN`: Your frontend URL (e.g., `https://task-management-app.vercel.app`)
  - `NODE_ENV`: `production`
   - Do **not** set `API_PORT` in Render; Render injects `PORT` automatically and the app uses it in production.

### 3. Frontend (Vercel)
- Import the project into Vercel.
- **Root Directory**: `apps/web`.
- **Framework Preset**: Next.js (automatic).
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://task-management-api.onrender.com`)
- Deploy!

## API Documentation

- Swagger UI is available at `/api/docs` on your backend URL.

## CI/CD (GitHub Actions)

- Workflow file: `.github/workflows/ci-cd.yml`
- Quality gates run on PRs and pushes to `main`:
   - `pnpm run lint`
   - `pnpm run check-types`
   - `pnpm run build`
- Deploys run only on push to `main` and only when secrets exist:
   - Backend (Render): `RENDER_DEPLOY_HOOK`
   - Frontend (Vercel): `VERCEL_DEPLOY_HOOK`
- Deploy jobs are path-aware:
   - Backend deploy runs only when backend/shared-backend paths change.
   - Frontend deploy runs only when frontend/shared-frontend paths change.

### Required repository secrets

- `RENDER_DEPLOY_HOOK`: Render deploy hook URL for the backend service
- `VERCEL_DEPLOY_HOOK`: Vercel deploy hook URL for the frontend project

### Important deployment note

- If you use this workflow for deployments, disable auto-deploy from Git provider in Render/Vercel to avoid duplicate deployments.

## Reviewer Notes

- CI/deploy workflow is documented as the target approach and can be added when deployment automation is enabled.

## Security Highlights

- JWT in `HttpOnly` cookies with environment-aware policy (`Lax` local dev, `None` in production for cross-site)
- Session-based refresh token rotation with per-session logout and global revoke support
- Lightweight session-check endpoint for page-load auth bootstrap — no token rotation or unnecessary DB writes
- Automatic access token refresh in the HTTP client with single-flight queuing; only forces logout when the refresh itself is rejected
- Transient network failures surface a recoverable error state rather than triggering a spurious logout
- JWT secrets required at startup — missing configuration fails fast with no weak-default fallback
- Rate-limiter per-user buckets use only server-verified identity
- Argon2id password hashing
- Global validation/sanitization via Zod + pipes
- Secure headers (Helmet)

## Deliverables Reference

- Planning: [PLAN.md](PLAN.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

## Assessment Traceability

### Phase 1 — Planning
- Backend choice and justification: [PLAN.md](PLAN.md)
- Architecture and security planning: [PLAN.md](PLAN.md), [ARCHITECTURE.md](ARCHITECTURE.md)

### Phase 2 — Implementation & Deployment 
- Frontend: login/register, protected routes, task CRUD UI, auth bootstrap, automatic token refresh, and network error recovery
- Backend endpoints:
   - `POST /auth/register`
   - `POST /auth/login`
   - `GET /auth/me`
   - `POST /auth/refresh`
   - `POST /auth/logout`
   - `POST /auth/revoke`
   - `GET /tasks`
   - `POST /tasks`
   - `PUT /tasks/:id`
   - `DELETE /tasks/:id`
- Security: secure token storage, password hashing, rate limiting, validation/sanitization, authorization by ownership, safe error handling, fail-fast secret configuration
- Deployment: backend + database active; frontend and CI automation follow the frontend/deployment phase

