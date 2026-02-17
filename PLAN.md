# PLAN.md — Task Management System

Author: Associate Software Engineer Candidate  
Date: February 2026  
Assessment: Twist Digital (Phase 1)

## 1) Backend Choice and Justification

**Selected stack:** NestJS (Fastify adapter) + Drizzle ORM + PostgreSQL (Supabase).

NestJS is chosen over Express.js because it enforces module boundaries, dependency injection, and consistent separation between transport, business, and data-access logic. This improves maintainability and testability as features grow. Fastify adapter is selected for generally better throughput and lower overhead.

Drizzle is selected as the “better tech choice” over heavier ORM options because it keeps runtime lean, aligns closely with SQL, and provides strong TypeScript inference across schema and queries. PostgreSQL (Supabase) is selected to enforce relational integrity for user-task ownership and to use managed infrastructure suitable for rapid but production-aware delivery.

## 2) Architecture Overview

**Repository pattern:** Turborepo monorepo with pnpm.

- `apps/web`: Next.js 14 (App Router) frontend.
- `apps/api`: NestJS backend.
- `packages/contract`: shared Zod schemas and inferred types (single source of truth for FE/BE contracts).
- `packages/database`: Drizzle schema, migrations, and DB client.

Frontend uses Axios + TanStack Query. Axios interceptors centralize auth/error handling (e.g., 401 redirect); TanStack Query handles caching, loading/error states, and SSR hydration to avoid initial loading flicker. Backend is organized by domain modules (`auth`, `tasks`) and enforces ownership in every task query (`WHERE user_id = current_user`).
UI uses shadcn/ui components with Tailwind token-based styling and a CSS-variable theme system for correct light/dark mode behavior and accessible contrast.

## 3) Security Considerations

**Authentication and token storage**
- JWT stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookie (not localStorage).
- Token Versioning implemented via `users.token_version` and JWT payload version claim.
- Auth guard compares token version with DB value; mismatch invalidates token immediately.
- Supports instant revocation (logout all devices / credential reset) by incrementing `token_version`.

**Credential and input security**
- Password hashing with Argon2id.
- Global request validation and sanitization using Zod + Nest validation pipe (`whitelist: true`).

**API and platform hardening**
- Rate limiting via NestJS Throttler (`5/min` auth routes, `100/min` task routes).
- Helmet for secure headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
- CSRF risk reduced by SameSite cookies; Origin validation on state-changing requests.
- Global exception filter returns standardized errors and prevents stack-trace leakage.

## 4) Deployment and Delivery

- Frontend: Vercel
- Backend: Render (Dockerized NestJS)
- Database: Supabase (PostgreSQL)
- CI/CD: GitHub Actions for lint, type-check, build, and path-based deploy triggers.

This plan prioritizes secure defaults, clear module boundaries, and pragmatic production-readiness while staying aligned with the assessment scope and timeline.
