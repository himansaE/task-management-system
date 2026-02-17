# Task Management System (Assessment)

Associate Software Engineer assessment.

## Stack

- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui, TanStack Query, Axios
- Backend: NestJS (Fastify), Drizzle ORM
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
2. Start local infra (if using Dockerized DB):
   - `docker compose up -d`
3. Run migrations:
   - `pnpm --filter @repo/database migrate`
4. Start development:
   - `pnpm dev`

## CI/CD Strategy (Hybrid)


- GitHub Actions runs quality gates (`lint`, `check-types`, `build`, `test`) on PRs and main.
- Vercel handles frontend deployment natively from Git (project root: `apps/web`).
- Render backend deploy is triggered after quality passes (via deploy hook).

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

- Quality pipeline always runs.
- Deployment jobs may be skipped automatically on forks without deployment secrets.
- This is expected behavior and prevents false CI failures during review.

## Security Highlights

- JWT in `HttpOnly` + `Secure` + `SameSite=Strict` cookies
- Token versioning for immediate session revocation
- Argon2id password hashing
- Global validation/sanitization via Zod + pipes
- Rate limiting + secure headers (Helmet)

## Deliverables Reference

- Planning: [PLAN.md](PLAN.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
