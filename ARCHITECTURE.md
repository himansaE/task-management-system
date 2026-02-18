# Architecture Document — Task Management System

> Internal reference document. Not a deliverable — complements the 1-page [PLAN.md](PLAN.md).

---

## 1. System Architecture

### 1.1 Architectural Pattern

**Monolithic Repository, Modular Backend.** Turborepo orchestrates a pnpm workspace containing two applications and four shared packages. The backend follows a **Modular Monolith** pattern via NestJS modules — each domain (Auth, Tasks) is a self-contained module with its own controller, service, and repository. This keeps the codebase simple for a single-developer assessment while demonstrating the structural discipline needed for team-scale systems.

### 1.2 Data Flow

```mermaid
flowchart LR
  U[User Browser]
  W[Next.js App<br/>Client + Server Components]
  M[Edge Middleware<br/>Cookie check]
  A[Axios or server fetch]
  N[NestJS API Gateway]
  G[Guards and Pipes<br/>Throttler, JWT, Zod]
  S[Domain Services]
  D[Drizzle Repository]
  P[(Supabase PostgreSQL)]

  U --> W
  W --> M
  M -->|allowed| A
  A --> N
  N --> G
  G --> S
  S --> D
  D --> P
```

---

## 2. Technology Stack — Detailed Justification

| Layer | Technology | Why This Over Alternatives |
|---|---|---|
| **Monorepo** | Turborepo + pnpm | Cached builds, shared `tsconfig`/`eslint`, strict package boundaries. pnpm's strict node_modules prevents phantom deps. |
| **Frontend** | Next.js 14 (App Router) | Assessment requirement. RSC for SEO/perf, Middleware for edge auth checks, Server Actions for non-interactive posts. |
| **UI** | Tailwind CSS + Shadcn/ui | shadcn component primitives with Tailwind token-based styling. Theme values come from semantic CSS variables and are switched by a theme provider for correct light/dark modes without hardcoded colors. |
| **HTTP Client** | Axios | Response interceptors enable global 401 handling (auto-redirect to login) and consistent error mapping. `credentials: 'include'` auto-sends cookies. `fetch` lacks interceptors without wrapper boilerplate. |
| **State Mgmt** | TanStack Query | Server-state solution: handles `isLoading`, `isError`, `data`, cache invalidation, and optimistic updates. Dehydrate/hydrate pattern enables SSR → client handoff with zero loading flicker. Replaces manual `useEffect` patterns. |
| **Form Validation** | react-hook-form + Zod | Shares Zod schemas from `packages/contract`. Validation runs client-side before submission AND server-side via NestJS pipes — same rules, zero drift. |
| **Backend** | NestJS + Fastify | DI container enforces separation of concerns. Fastify adapter generally provides better throughput than Express in comparable setups. Built-in support for Guards, Pipes, Interceptors, Filters — clean middleware layering without ad-hoc Express middleware chains. |
| **ORM** | Drizzle ORM | Zero-runtime (no query engine binary like Prisma). SQL-aligned syntax reduces abstraction leaks. Type inference from schema → queries → responses. Edge-compatible (no WASM dependency). |
| **Database** | PostgreSQL (Supabase) | Relational integrity for `users.id → tasks.user_id`. Supabase adds RLS as defense-in-depth. Managed backups, connection pooling via PgBouncer. |
| **Hashing** | Argon2id | Winner of the Password Hashing Competition. Memory-hard: resistant to GPU/ASIC attacks. Configurable memory cost, time cost, parallelism. Superior to Bcrypt for modern threat models. |
| **Deployment** | Vercel + Render + Supabase | Vercel: native Next.js edge deployment. Render: Docker-based NestJS with auto-deploy from Git. Supabase: managed Postgres with free tier. All have reliable free tiers for assessment purposes. |

### 2.1 UI Theming Strategy

- Theme provider toggles `light` and `dark`.
- Colors come from semantic CSS variables consumed by Tailwind tokens.
- shadcn components consume semantic tokens instead of hardcoded hex values.
- Core text, surfaces, and interactive states target WCAG AA contrast.

---

## 3. Security Architecture — Deep Dive

### 3.1 Authentication: Token Versioning Strategy

Standard JWTs are stateless — once issued, they cannot be revoked until expiry. This is a known weakness. Token Versioning solves this without maintaining a server-side blacklist.

**Database Schema:**
```
users.token_version: INTEGER DEFAULT 0
```

**Login Flow:**
1. User submits credentials → server validates → Argon2id hash comparison.
2. Server generates JWT: `{ sub: user.id, v: user.token_version, iat, exp }`.
3. JWT placed in response cookie: `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
4. Browser stores cookie — JavaScript cannot read it (`HttpOnly`).

**Request Authentication:**
1. `JwtAuthGuard` extracts token from cookie header.
2. Verifies JWT signature and expiry.
3. Loads user from DB (with in-memory cache for hot path).
4. **Version check:** `if (payload.v !== user.token_version) → 401 Unauthorized`.
5. Attaches `user` to request context via `@CurrentUser()` decorator.

**Revocation (Logout All Devices / Password Reset / Security Breach):**
1. `PATCH /auth/revoke` → increments `user.token_version` in database.
2. All existing JWTs carry the old version → instantly rejected by the guard.
3. No token blacklist needed. O(1) revocation.

### 3.2 Cookie Security Flags

| Flag | Value | Purpose |
|---|---|---|
| `HttpOnly` | `true` | Prevents `document.cookie` access → mitigates XSS token theft |
| `Secure` | `true` | Cookie only sent over HTTPS → prevents MITM interception |
| `SameSite` | `Strict` | Cookie not sent on cross-origin requests → mitigates CSRF |
| `Path` | `/` | Cookie available to all API routes |
| `Max-Age` | `86400` (24h) | Token expiry aligned with JWT `exp` claim |

### 3.3 Defense-in-Depth Layers

| Layer | Mechanism | Threat Mitigated |
|---|---|---|
| **Transport** | HTTPS only (Secure cookie flag) | Man-in-the-middle |
| **Authentication** | JWT + Token Versioning | Session hijacking, stale tokens |
| **Authorization** | Ownership check in every task query (`WHERE user_id = $1`) | Horizontal privilege escalation |
| **Input** | Zod schema validation + `whitelist: true` (strip unknown fields) | Injection, mass assignment |
| **Rate Limiting** | ThrottlerModule: 5/min auth, 100/min data | Brute-force, credential stuffing, DoS |
| **Headers** | Helmet: CSP, HSTS, X-Frame-Options, X-Content-Type-Options | XSS, clickjacking, MIME sniffing |
| **Errors** | Global `AllExceptionsFilter` → standard response shape | Stack trace leaks, information disclosure |
| **Passwords** | Argon2id (memory: 64MB, iterations: 3, parallelism: 1) | Offline cracking |

### 3.4 CSRF Protection Strategy

With `SameSite=Strict` cookies, CSRF via cross-origin form submissions is blocked at the browser level. As an additional defense, the `JwtAuthGuard` validates the `Origin` header on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) against a whitelist of allowed origins. This double-layer approach avoids the complexity of CSRF tokens while maintaining security.

---

## 4. Data Design

### 4.1 Entity-Relationship

```mermaid
erDiagram
  USERS ||--o{ TASKS : owns

  USERS {
    uuid id PK
    varchar email UK
    varchar name
    varchar password
    int token_version
    timestamptz created_at
    timestamptz updated_at
  }

  TASKS {
    uuid id PK
    uuid user_id FK
    varchar title
    text description
    enum status
    enum priority
    timestamptz due_date
    timestamptz created_at
    timestamptz updated_at
  }
```

### 4.2 Design Decisions

- **UUID primary keys**: Prevents enumeration attacks (`/tasks/1`, `/tasks/2`). Safe for distributed ID generation.
- **`token_version`**: Critical for the Token Versioning security strategy. Integer increment is atomic and race-condition safe.
- **`user_id` indexed**: Tasks are always queried by owner. Index ensures O(log n) lookups.
- **ENUM types**: Status and priority are constrained at the database level — invalid values are impossible, not just validated.
- **Timestamps with timezone**: `TIMESTAMPTZ` avoids timezone ambiguity. `updated_at` auto-updates via Drizzle `.$onUpdate()`.

---

## 5. API Design

### 5.1 Standardized Response Envelope

Every API response follows a predictable shape. The frontend never needs to guess the response structure.

**Success:**
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["title must be at least 1 character"],
  "timestamp": "2026-02-18T10:00:00.000Z"
}
```

### 5.2 Endpoint Specification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create account. Returns user (no token — forces login). |
| `POST` | `/auth/login` | Public | Validate credentials → Set HttpOnly cookie (JWT). |
| `POST` | `/auth/refresh` | Cookie | Reissue JWT with fresh expiry. Checks `token_version`. |
| `POST` | `/auth/logout` | Cookie | Clear cookie. Optionally increment `token_version`. |
| `GET` | `/tasks` | Cookie | List authenticated user's tasks. Supports `?status=&priority=&page=&limit=`. |
| `POST` | `/tasks` | Cookie | Create task. Title required, status defaults to `TODO`. |
| `PUT` | `/tasks/:id` | Cookie | Update task. Ownership enforced (`WHERE id = $1 AND user_id = $2`). |
| `DELETE` | `/tasks/:id` | Cookie | Delete task. Ownership enforced. Returns `204 No Content`. |

### 5.3 Possible Use Cases

```mermaid
flowchart LR
  A[User]
  B[Register Account]
  C[Login]
  D[View Dashboard]
  E[Create Task]
  F[Update Task]
  G[Delete Task]
  H[Refresh Session]
  I[Revoke All Sessions]

  A --> B
  A --> C
  A --> D
  A --> E
  A --> F
  A --> G
  A --> H
  A --> I
```

---

## 6. Monorepo File Structure

```
root/
├── .github/workflows/           # CI/CD pipelines
├── .husky/                      # Git hooks
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/             # Routing layer
│   │   │   ├── features/        # Auth, Tasks (vertical slices)
│   │   │   ├── components/      # Shared UI primitives
│   │   │   ├── lib/             # Axios, query client, utils
│   │   │   └── providers/       # App-level providers
│   │   └── middleware.ts        # Route protection
│   └── api/                     # NestJS backend
│       ├── src/
│       │   ├── modules/         # auth, tasks
│       │   ├── common/          # guards, filters, pipes, decorators
│       │   └── config/          # typed env config
│       └── test/                # integration tests
│
├── packages/
│   ├── contract/                # shared Zod schemas + inferred types
│   ├── database/                # Drizzle schema + migrations + db client
│   ├── eslint-config/           # shared lint config
│   ├── typescript-config/       # shared tsconfig presets
│   └── ui/                      # shared UI components
│
├── .env.example                 # template only (no secrets)
├── docker-compose.yml           # local infra
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 6.1 Key Structural Decisions

**Feature-based frontend (vertical slicing):** Each feature (`auth`, `tasks`) co-locates its components, hooks, and API calls. A developer working on tasks never needs to navigate to a separate `hooks/` or `api/` directory at the root. This scales linearly — adding a new feature is adding a new folder.

**Domain-driven backend modules:** NestJS modules are self-contained. The `TasksModule` declares its own controller, service, and repository. It imports `DatabaseModule` for the Drizzle client. Dependencies are explicit in the module decorator.

**Isolated database package:** Migrations run independently of the NestJS build. In CI, `pnpm --filter @repo/database migrate` runs before the API build. This prevents a bad migration from blocking the entire pipeline.

**Runtime/package boundary:** `packages/database` exports database primitives (schema + client factory). Domain repositories live in `apps/api` feature modules (`auth.repository`, `tasks.repository`) and are injected via Nest DI. This keeps business-specific data access in the backend service boundary.

**Environment loading:** Database tooling prefers host-provided `DATABASE_URL` and falls back to repo `.env` for local development. API startup loads environment files deterministically for both root and app working directories.

**Shared contract package:** The `packages/contract` package is the authoritative source for all request/response shapes. Both `apps/web` and `apps/api` depend on it. If a schema changes, TypeScript compilation fails in both consumers immediately — no runtime surprises.

---

## 7. DevOps & CI/CD

### 7.1 CI Pipeline (GitHub Actions)

**Strategy: Hybrid (Option A default, Option B upgrade path).**

- **Default (Option A):** Use Vercel native Git deployment for `apps/web` on free plan; use GitHub Actions as quality gate; trigger API deploy to Render only after quality passes.
- **Upgrade (Option B):** Move web deploy into GitHub Actions with Vercel token-based deploy for strict orchestration.
- **Reviewer safety:** Deployment jobs are secret-gated, so forks still run quality checks without failing due to missing credentials.

```yaml
# Trigger: Pull Request and push to main
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - pnpm install --frozen-lockfile
      - turbo run lint          # ESLint across all packages
      - turbo run check-types   # tsc --noEmit across all packages
      - turbo run build         # Verify build graph passes
      - turbo run test          # Jest unit + integration tests

  # Vercel deploys apps/web via Git integration.
  # Keep deploy-web disabled unless switching to strict orchestration.
  deploy-web:
    needs: quality
    if: false 
    # Example - gate:
    # if: github.ref == 'refs/heads/main' && secrets.VERCEL_TOKEN != ''

  deploy-api:
    needs: quality
    if: github.ref == 'refs/heads/main' && secrets.RENDER_DEPLOY_HOOK != ''
    # Trigger Render deploy hook only if API-related paths changed
```

### 7.1.1 Vercel Free Plan Notes

- Vercel Hobby plan works well for this assessment with monorepo support.
- Set Vercel project root to `apps/web`.
- Protect `main` with required status checks (`quality`) to prevent unverified merges.
- This avoids deployment-token complexity for reviewers while preserving CI quality enforcement.

### 7.1.2 Option B (Strict Orchestration) — Reviewer-Safe Setup

- Add secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Gate job with `if: github.ref == 'refs/heads/main' && secrets.VERCEL_TOKEN != ''`.
- Forks without secrets skip deploy jobs gracefully; quality gate still runs.
- Prefer Vercel CLI-based deploy steps for long-term maintainability.

### 7.2 Commit Standards

- **Conventional Commits** enforced by `commitlint`: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **Husky** pre-commit hook: runs `lint-staged` (Prettier + ESLint on staged files only).
- **Branch strategy:** `main` (production), `develop` (integration), feature branches (`feat/auth`, `feat/tasks`).

### 7.3 Environment Management

- `.env.example` committed with placeholder values — documents every required variable.
- `.env` and `.env.local` in `.gitignore`.
- Production secrets managed via Vercel/Render dashboards — never in Git.
- CI deployment secrets (when enabled): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK`.
- **Typed config:** NestJS `ConfigModule` validates env vars with Zod on startup. Missing or malformed variables crash the app immediately with a clear error, not randomly at runtime.

---

## 8. Testing Strategy

| Type | Tool | Scope | What Gets Mocked |
|---|---|---|---|
| **Unit** | Jest | Services, utils, pure functions | DB client, external APIs |
| **Integration** | Supertest | Controllers + DB (full request lifecycle) | Nothing — uses real Postgres via Docker |
| **E2E** | Playwright | Full browser flows (login → create task → logout) | Nothing — hits deployed preview |

### 8.1 Testing Priorities (Assessment Scope)

1. **Auth service unit tests:** Password hashing, JWT generation, token version checking.
2. **Task service unit tests:** CRUD logic, ownership enforcement.
3. **Auth integration tests:** Register → Login → Access protected route → Logout.
4. **Task integration tests:** Create → Read → Update → Delete → Verify ownership isolation.

---

## 9. Developer Experience

### 9.1 Local Development Setup

```bash
# 1. Clone and install
git clone <repo> && cd task-management-system
pnpm install

# 2. Start local Postgres
docker compose up -d

# 3. Run migrations
pnpm --filter @repo/database migrate

# 4. Seed dev data (optional)
pnpm --filter @repo/database seed

# 5. Start all apps
pnpm dev  # Turborepo runs apps/web + apps/api concurrently
```

### 9.2 API Documentation

**Swagger/OpenAPI** auto-generated from NestJS decorators and Zod schemas. Available at `http://localhost:3001/api/docs` in development. Serves as the live contract reference — no manual YAML maintenance.

### 9.3 Typed Configuration

```typescript
// apps/api/src/config/app.config.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url(),
  PORT: z.coerce.number().default(3001),
});

// If any variable is missing or invalid, the app crashes on startup
// with a clear Zod error — not a cryptic "undefined" at runtime.
```

### 9.4 Health Check

`GET /health` — Returns `{ status: 'ok', db: 'connected', uptime: 12345 }`. Used by Render for liveness probes and by monitoring dashboards.

---

## 10. Implementation Order

| # | Task | Depends On | Estimated Effort |
|---|---|---|---|
| 1 | Scaffold monorepo (apps + packages) | — | 1h |
| 2 | `packages/contract`: Define Zod schemas | — | 1h |
| 3 | `packages/database`: Drizzle schema + initial migration | #2 | 2h |
| 4 | `apps/api`: NestJS bootstrap + AuthModule | #3 | 4h |
| 5 | `apps/api`: TasksModule + ownership guard | #4 | 3h |
| 6 | `apps/api`: Security hardening (Helmet, Throttle, Filters) | #5 | 2h |
| 7 | `apps/web`: Next.js scaffold + Axios + TanStack setup | — | 2h |
| 8 | `apps/web`: Auth pages (Login, Register) | #4, #7 | 3h |
| 9 | `apps/web`: Dashboard + Task CRUD UI | #5, #7 | 4h |
| 10 | `apps/web`: Route protection (Middleware) | #8 | 1h |
| 11 | Integration tests | #6, #9 | 3h |
| 12 | Deployment (Vercel + Render + Supabase) | #11 | 2h |
| 13 | README.md + final polish | #12 | 1h |
