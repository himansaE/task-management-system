# PLAN.md — Task Management System


## 1) Backend Choice and Justification

**Selected stack:** NestJS (Express adapter) + Drizzle ORM + PostgreSQL (Supabase).

NestJS is chosen because it enforces module boundaries, dependency injection, and consistent separation between transport, business, and data-access logic. This improves maintainability as features grow.

Drizzle is selected as the “better tech choice” over heavier ORM options because it keeps runtime lean, aligns closely with SQL, and provides strong TypeScript inference across schema and queries. PostgreSQL (Supabase) is selected to enforce relational integrity for user-task ownership and to use managed infrastructure suitable for rapid but production-aware delivery.

## 2) Architecture Overview

**Repository pattern:** Turborepo monorepo with pnpm.

- `apps/web`: Next.js 16 (App Router) frontend.
- `apps/api`: NestJS backend.
- `packages/contract`: shared Zod schemas and inferred types (single source of truth for FE/BE contracts).
- `packages/database`: Drizzle schema, migrations, and DB client.

Frontend uses Axios + TanStack Query for all API communication. Auth state is managed client-side with session bootstrap, automatic token refresh, and graceful error recovery for transient network failures. Backend is organized by domain modules (`auth`, `tasks`) and enforces ownership in every task query (`WHERE user_id = current_user`).
UI uses shadcn/ui components with Tailwind token-based styling and a CSS-variable theme system for correct light/dark mode behavior and accessible contrast.

## 3) Security Considerations

**Authentication and token storage**
- Access and refresh JWTs are stored in `HttpOnly` cookies (not localStorage).
- A dedicated lightweight session-check endpoint allows the frontend to verify an active session on page load without rotating the refresh token, avoiding unnecessary DB writes.
- When the access token expires, the HTTP client transparently refreshes it with a single in-flight request and retries any queued requests — no forced logout for normal expiry.
- Transient network failures are surfaced as a recoverable error state; the user can retry without being logged out.
- Refresh sessions are persisted server-side and rotated on each refresh call.
- Logout revokes only the current session, while revoke-all invalidates all sessions.
- JWT secrets are required at startup — missing configuration fails fast rather than falling back to weak defaults.

**Credential and input security**
- Password hashing with Argon2id.
- Global request validation and sanitization using Zod + Nest validation pipe (`whitelist: true`).

**API and platform hardening**
- Rate limiting via NestJS Throttler (`5/min` auth routes, `100/min` task routes). Per-user buckets use only server-verified identity.
- Helmet for secure headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
- CSRF risk reduced by SameSite cookies and HttpOnly token storage.
- Standard HTTP exceptions are returned by Nest for invalid/unauthorized flows.

## 4) Deployment and Delivery

- Frontend: Vercel
- Backend: Render (Dockerized NestJS)
- Database: Supabase (PostgreSQL)
- CI/CD: planned GitHub Actions quality pipeline (`lint`, `check-types`, `build`) with deploy triggers.

This plan prioritizes secure defaults, clear module boundaries, and pragmatic production-readiness while staying aligned with the assessment scope and timeline.

## 5) Phase Plan 

**Phase 1 — Planning **
- Backend choice and rationale completed.
- Architecture and security strategy defined.
- Better-tech choices justified (NestJS + Drizzle + Supabase, shadcn + Tailwind).

**Phase 2 — Implementation & Deployment**
- Frontend: register/login, protected routes, task CRUD UI, auth bootstrap, automatic token refresh, and network error recovery.
- Backend: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/revoke`, `GET/POST/PUT/DELETE /tasks`.
- Security: password hashing, validation/sanitization, rate limiting, secure token storage, ownership enforcement, safe error handling, fail-fast secret configuration.
- Deployment: backend + DB active; frontend deployment follows frontend implementation phase.


## 6) Definition of Done 

- All required endpoints implemented.
- Fully responsive UI with desktop and mobile screen support(Resize the window to chack)
- Users can only access and modify their own tasks.
- Auth token is stored securely in HttpOnly cookie with revocation support.
- Frontend covers full task CRUD, protected routes, and auth flows with error recovery.
