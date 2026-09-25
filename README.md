<p align="center">
  <a href="https://shortlynk.in">
    <img src="docs/images/hero-banner.jpg" alt="Shortlynk — Shorten. Analyze. Optimize." width="100%" />
  </a>
</p>

<h1 align="center">Shortlynk</h1>

<p align="center">
  <b>A production link management platform for branded short URLs, real-time click tracking, and developer-friendly API access.</b><br />
  Built as a fullstack engineering project — deployed live, tested against real PostgreSQL, and handling real traffic.
</p>

<p align="center">
  <a href="https://shortlynk.in">
    <img src="https://img.shields.io/badge/Live_App-shortlynk.in-10B981?style=for-the-badge&logo=safari&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/86_Tests_Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white" alt="86 Tests Passing" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
</p>

<p align="center">
  <a href="https://shortlynk.in"><b>Try Live →</b></a>&ensp;·&ensp;
  <a href="#-features"><b>Features</b></a>&ensp;·&ensp;
  <a href="#%EF%B8%8F-architecture"><b>Architecture</b></a>&ensp;·&ensp;
  <a href="#-key-engineering-decisions"><b>Engineering Decisions</b></a>&ensp;·&ensp;
  <a href="#-quick-start"><b>Quick Start</b></a>&ensp;·&ensp;
  <a href="#-api-reference"><b>API</b></a>
</p>

<br />

## Why I Built This

I wanted to build something that's **not a tutorial project** — a system deployed on a real domain, handling real traffic, with real infrastructure problems to solve.

URL shortening sounds simple. It's not. The moment you deploy it, you hit:
- **Collision handling** at the database layer (what happens when two users generate the same 6-character code at the same instant?)
- **Edge routing** (how does `shortlynk.in/my-brand` hit your backend redirect engine without exposing raw hosting domains, while also not intercepting `/dashboard`?)
- **Analytics integrity** (how do you stop Google's crawler from inflating your click counts on archived links?)
- **Touch ergonomics** (how do you show action buttons on iPads that have no hover state?)

These are the problems that taught me the most — and the ones I document in the [Engineering Decisions](#-key-engineering-decisions) section below.

> **Try it yourself** — go to [shortlynk.in](https://shortlynk.in), paste any URL, and click **Shorten**. No signup required.

<br />

## 📸 The Product

<table>
  <tr>
    <td width="50%">
      <a href="https://shortlynk.in">
        <img src="docs/images/hero-demo-url.jpg" alt="Guest demo — shorten a URL without signing up" />
      </a>
      <p align="center"><b>Guest Demo</b> — shorten a URL without creating an account.<br />Sign up later and your links are automatically claimed.</p>
    </td>
    <td width="50%">
      <a href="https://shortlynk.in">
        <img src="docs/images/dashboard-dark.jpg" alt="Dashboard — manage, search, filter, and track all your links" />
      </a>
      <p align="center"><b>Dashboard</b> — real-time stats, search, status filtering,<br />pinning, custom aliases, 4-way sort, pagination.</p>
    </td>
  </tr>
</table>

<!-- TODO: Add a 30-second demo GIF showing: create link → copy → paste in browser → watch click count increment -->

<br />

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🔗 Link Management</h3>
      <ul>
        <li><b>Custom branded aliases</b> — <code>shortlynk.in/my-brand</code> alongside auto-generated 6-char codes</li>
        <li><b>Pin priority links</b> to the top of your dashboard</li>
        <li><b>Archive & deactivate</b> — returns HTTP 410 Gone with a branded tombstone page</li>
        <li><b>5-second undo buffer</b> — deletions feel instant; undo before permanent removal</li>
      </ul>
      <h3>🔍 Search, Filter & Sort</h3>
      <ul>
        <li><b>Server-side search</b> across URLs, short codes, and aliases (SQL injection-safe)</li>
        <li><b>5 status filters:</b> All, Active, Expiring, Pinned, Archived</li>
        <li><b>4-way sort:</b> Newest, Oldest, Most Clicks, Least Clicks</li>
        <li><b>Paginated API</b> with DoS-bounded limits (max 50/page)</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📊 Analytics & Tracking</h3>
      <ul>
        <li><b>Atomic click counters</b> — every redirect increments via <code>sql\`clicks + 1\`</code></li>
        <li><b>Dashboard stats</b> — total links, clicks, active links, avg velocity via <code>COUNT(*) FILTER</code></li>
        <li><b>UTM preservation</b> — query params pass through to destination without stripping</li>
        <li><b>Public platform telemetry</b> with 60-second in-memory cache</li>
      </ul>
      <h3>🛡️ Security</h3>
      <ul>
        <li><b>JWT auth</b> with client-side expiration guards and 401 auto-logout</li>
        <li><b>3-tier rate limiting:</b> API (100/15m), auth (10/15m), demo (3/IP/day)</li>
        <li><b>Zod validation</b> on every input — bodies, query params, route params</li>
        <li><b>10kb body limit,</b> request correlation IDs, structured Pino logging</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <h3>🎨 Frontend</h3>
      <ul>
        <li><b>Dark mode</b> — OS preference detection, <code>color-scheme</code> synchronization (fixes Chromium scrollbar styling)</li>
        <li><b>Optimistic mutations</b> via TanStack Query — UI updates instantly, rolls back on failure</li>
        <li><b>Hardware-aware touch</b> — <code>@media (hover: hover) and (pointer: fine)</code> shows/hides action buttons based on device type</li>
        <li><b>Guest-to-user conversion</b> — anonymous demo links are atomically claimed on signup (<code>WHERE userId IS NULL</code>)</li>
        <li><b>Error boundary</b> — global crash recovery with 1-click reload, preventing white-screen failures</li>
      </ul>
    </td>
  </tr>
</table>

<br />

## 🏗️ Architecture

```mermaid
flowchart TD
    User(("🌐 End User"))

    subgraph Vercel["Vercel Edge Network"]
        direction TB
        T1["Tier 1: /api/* → Render API"]
        T2["Tier 2: /dashboard, /login → SPA"]
        T3["Tier 3: /:slug — 3-50 chars → Render Redirect Engine"]
        T4["Tier 4: /* → SPA Fallback"]
    end

    subgraph Frontend["Frontend — React 19 + Vite 8"]
        SPA["Single-Page Application"]
        TQ["TanStack Query v5\n(Server State Cache)"]
        Axios["Axios Client\n(JWT Interceptor + 401 Auto-Logout)"]
    end

    subgraph Backend["Backend — Express 5 + Node 22"]
        MW["Middleware Stack\nHelmet → CORS → 10kb Limit → Request ID → Pino"]
        RL["Rate Limiters\nAPI: 100/15m · Auth: 10/15m · Demo: 3/day"]
        Modules["Feature Modules\nAuth · URL · Stats · Redirect"]
        Errors["Error Hierarchy\nAppError → BadRequest · Unauthorized\nNotFound · Conflict · ArchivedUrl(410)"]
    end

    subgraph Database["PostgreSQL 16 — Neon Serverless"]
        Pool["pg Pool\nmax:10 · idle:30s · timeout:10s"]
        Drizzle["Drizzle ORM\n6 SQL Migrations"]
        Tables["users · urls\nComposite B-tree: (user_id, is_pinned)"]
    end

    User --> Vercel
    T1 --> Axios
    T2 --> SPA
    T3 --> Modules
    SPA --> TQ --> Axios
    Axios -->|"HTTPS / Bearer JWT"| MW
    MW --> RL --> Modules
    Modules --> Errors
    Modules --> Drizzle
    Drizzle --> Pool --> Tables
```

**Why this topology?** Shortlynk runs on a split deployment: the React SPA on Vercel's CDN edge, the API on Render, and the database on Neon serverless PostgreSQL. The critical piece is the **4-tier Vercel rewrite** in [`vercel.json`](frontend/vercel.json) — it routes `/api/*` calls and `/:slug` redirect traffic to the backend without exposing Render's raw hosting domain, while protecting SPA routes like `/dashboard` from being intercepted by the slug regex. Getting this wrong creates a "black hole" where custom vanity links silently route to the SPA instead of the redirect engine — a bug I caught and documented in [ADR #40](dev_team_internals/04_notes/40_vercel_edge_reverse_proxy_four_tier_routing_precedence.md).

### Database Schema

```mermaid
erDiagram
    users ||--o{ urls : creates
    users {
        uuid id PK
        text name
        text email UK
        text password_hash
        varchar role "default: user"
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }
    urls {
        uuid id PK
        uuid user_id FK "nullable — anonymous demo links"
        varchar short_code UK "6 chars, auto-generated"
        text original_url
        varchar custom_alias UK "3–50 chars, optional"
        varchar status "active | expiring | archived"
        boolean is_pinned "default: false"
        integer sort_order "default: 0"
        integer clicks "default: 0, atomic increment"
        timestamp created_at
        timestamp updated_at
    }
```

**Key index:** `urls_user_pinned_idx` — composite B-tree on `(user_id, is_pinned)`. Dashboard queries always sort pinned links first; this index serves that ordering without a full-table sort.

<br />

## 🧠 Key Engineering Decisions

These are the tradeoffs that shaped the system — not just what I chose, but **why**, and **what I rejected**.

> Full Architecture Decision Records (40+ documents) are maintained in [`dev_team_internals/04_notes/`](dev_team_internals/04_notes/).

<details open>
<summary><b>Express 5 over Fastify</b></summary>

**Chose:** Express 5 — native async error propagation lets you `throw` in route handlers without wrapper boilerplate. Helmet, CORS, and `express-rate-limit` are battle-tested middleware.

**Rejected:** Fastify — faster raw throughput, but the middleware ecosystem is smaller and less mature for this use case.
</details>

<details open>
<summary><b>Drizzle ORM over Prisma</b></summary>

**Chose:** Drizzle — type-safe query builder with zero runtime overhead. Migrations are plain `.sql` files I can audit, version-control, and run in any environment.

**Rejected:** Prisma — runtime client adds overhead, query generation is opaque (hard to debug slow queries), and the schema-first workflow adds friction for rapid iteration.
</details>

<details open>
<summary><b>Offset pagination over cursor-based</b></summary>

**Chose:** Offset — per-user link count is bounded (hundreds, not millions). Simpler, well-understood, and sufficient for the access pattern.

**Rejected:** Cursor-based — better for unbounded social feeds, but adds complexity (opaque cursors, no "jump to page 5") for near-zero benefit at this scale.
</details>

<details open>
<summary><b>HTTP 410 Gone over 404 for archived links</b></summary>

**Chose:** RFC 9110 `410 Gone` — signals permanent decommission to search engines, triggering index removal. The status check runs *before* the click increment to immunize analytics from crawler traffic.

**Rejected:** `404` (ambiguous — was it deleted or never existed?), `302` to error page (increments clicks, corrupting analytics).

**Bonus:** Content negotiation — browsers (`Accept: text/html`) get redirected to a branded `/deactivated` tombstone page with signup CTAs. API clients get clean `410` JSON. Same endpoint, two experiences.
</details>

<details>
<summary><b>Aborted drag-and-drop reordering — and why cutting a feature is an engineering decision</b></summary>

I prototyped drag-and-drop link reordering with `@dnd-kit`. During architectural review, I found **three compounding hazards**:

1. **O(N) database writes per drag** — gapless integer ordering required a bulk `UPDATE` on every sibling row. For a user with 10,000 links, one drag rewrites 10,000 rows (WAL bloat, row locks). The proper fix is LexoRank or fractional indexing — significant complexity.
2. **`touch-action: none` broke mobile scrolling** — the drag handle consumed vertical touch gestures, locking the viewport on phones.
3. **TanStack Query cache desync** — reordering while a card was in the 5-second deletion undo buffer caused `arrayMove` index mismatches, making cards glitch to wrong positions.

**Decision:** Abort and amputate. Purged `@dnd-kit`, restored codebase via `git reset --hard HEAD`. URL shorteners deliver value through fast search and dynamic sorting, not manual card dragging.

This is documented in full in [ADR #35](dev_team_internals/04_notes/35_ADR_drag_and_drop_abortion_and_scaling_hazards.md).
</details>

<details>
<summary><b>Vercel edge routing — solving the vanity slug "black hole"</b></summary>

When I added custom vanity aliases (3–50 chars), the original Vercel rewrite regex `/:shortCode([A-Za-z0-9]{6})` stopped matching them. Vanity links fell through to the SPA catch-all, creating a silent routing black hole — links were created successfully in the database but never redirected users.

Expanding the regex naively to `{3,50}` would intercept SPA routes like `/dashboard` (9 chars, all alphanumeric).

**Solution:** A 4-tier rewrite precedence:
1. `/api/:path*` → backend API
2. `/(login|register|dashboard|...)` → SPA (protected by the backend's 47-entry `RESERVED_SLUGS` blacklist)
3. `/:slug([A-Za-z0-9_-]{3,50})` → redirect engine
4. `/*` → SPA fallback

Full analysis in [ADR #40](dev_team_internals/04_notes/40_vercel_edge_reverse_proxy_four_tier_routing_precedence.md).
</details>

<details>
<summary><b>PostgreSQL pool hardening — why the server kept crashing at 3 AM</b></summary>

Neon serverless PostgreSQL aggressively terminates idle TCP sockets when scaling down compute. With no pool configuration and no `error` listener, dropped idle clients emitted unhandled error events → `process.exit(1)` → Render container terminated → 30–60s production outage.

**Solution:**
- `max: 10` — avoids exhausting Neon's 20-connection starter cap
- `idleTimeoutMillis: 30000` — reclaims clients before Neon drops them
- `connectionTimeoutMillis: 10000` — fail-fast instead of infinite hang on cold start
- `pool.on('error')` — catches idle disconnects, logs via Pino, lets the pool self-heal
- Graceful shutdown with a 10-second `setTimeout.unref()` force-kill fallback

Documented in [ADR #38](dev_team_internals/04_notes/38_postgresql_connection_pool_resilience_and_crash_defense_architecture.md).
</details>

<br />

## 🛠️ Tech Stack

| Layer | Technology | Why This Choice |
|:---|:---|:---|
| **Backend** | Node.js 22, Express 5, TypeScript 6 (strict) | LTS runtime · native async errors · end-to-end type safety |
| **Database** | PostgreSQL 16 (Neon Serverless) | ACID transactions · `COUNT(*) FILTER` · composite B-tree indexes |
| **ORM** | Drizzle 0.45 | Zero-overhead type-safe SQL · auditable `.sql` migration files |
| **Validation** | Zod 4 | Runtime + compile-time schema safety from a single source of truth |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | Concurrent rendering · instant HMR · utility-first with `@theme` tokens |
| **Server State** | TanStack Query v5 | Cache deduplication · optimistic mutations with automatic rollback |
| **Forms** | React Hook Form + Zod resolvers | Performant uncontrolled inputs with schema-driven validation |
| **Auth** | JWT (jsonwebtoken) | Stateless auth · client-side expiration guard · 401 auto-logout via Axios interceptor |
| **Logging** | Pino + pino-http | Structured JSON logs · request correlation IDs · minimal runtime overhead |
| **Testing** | Vitest + Supertest | Real-database integration tests · Zod schema unit tests · 86 total |
| **Infrastructure** | Docker, Vercel Edge, Render, Neon | One-command local dev · CDN edge rewrites · auto-deploy · serverless DB |

<br />

## 🚀 Quick Start

**Prerequisites:** Node.js 22+, pnpm, Docker

```bash
# 1. Clone
git clone https://github.com/Harshkatare/clicku-url-shortener.git
cd clicku-url-shortener

# 2. Start PostgreSQL (Docker)
cd backend && docker compose up postgres -d

# 3. Backend — install, configure, migrate, run
cp .env.example .env
pnpm install && pnpm db:migrate && pnpm dev

# 4. Frontend (new terminal)
cd frontend && cp .env.example .env
pnpm install && pnpm dev
```

**→ Open [localhost:5173](http://localhost:5173)**

<details>
<summary>Environment variables</summary>

**Backend** (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shortlynk_db
JWT_SECRET=<any-string-min-10-characters>
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SHORT_URL_BASE=http://localhost:5000
```

</details>

<br />

## 🔌 API Reference

All endpoints return `{ success: boolean, message?: string, data?: T }`.

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/health` | — | Server liveness |
| `GET` | `/:slug` | — | **Redirect engine** — HTTP 302 with atomic click tracking, UTM pass-through, HTTP 410 for archived |

**Auth** (`/api/v1/auth`)

| Method | Endpoint | Rate Limit | Description |
|:---|:---|:---|:---|
| `POST` | `/auth/signup` | 10 / 15 min | Register → JWT |
| `POST` | `/auth/login` | 10 / 15 min | Login → JWT |
| `GET` | `/auth/me` | Standard | Current user profile |

**URLs** (`/api/v1/urls`) — all require `Bearer` JWT

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/urls` | Create short link (optional vanity alias) |
| `POST` | `/urls/demo` | Anonymous guest link (3/IP/day, no auth) |
| `POST` | `/urls/claim` | Claim anonymous link ownership |
| `GET` | `/urls` | Search, filter, sort, paginate |
| `GET` | `/urls/stats` | Portfolio stats (totals, active, avg clicks) |
| `PATCH` | `/urls/:id` | Update destination, alias, status, pin |
| `PATCH` | `/urls/:id/reorder` | Transactional sort-order update |
| `DELETE` | `/urls/:id` | Delete link |

**Platform** (`/api/v1/stats`)

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/stats/public` | Platform-wide telemetry (60s cache) |

<br />

## 🧪 Testing

**86 tests** · **9 suites** · runs against a **real PostgreSQL database** — no mocks.

```bash
pnpm test        # Run all
pnpm test:watch  # Watch mode
```

| Suite | Tests | What It Validates |
|:---|:---:|:---|
| `urls` | 43 | Full CRUD · query engine (search, filter, sort, pagination) · vanity alias conflicts · reordering transactions · tenant isolation · pinning · portfolio stats |
| `redirect` | 9 | 302 redirect · atomic click increment · UTM forwarding · HTTP 410 for archived · content negotiation |
| `url-query` | 8 | Zod query schema: defaults, coercion, DoS limit cap (50), sanitization |
| `auth` | 7 | Registration · login · duplicate rejection · JWT · `/me` profile · rate-limit decoupling |
| `vanity-alias` | 7 | Length bounds · character regex · reserved slug blocking (47 slugs) |
| `claim` | 6 | Guest → user ownership · idempotency · anti-hijack guards |
| `demo` | 3 | Anonymous link creation · redirect · validation |
| `health` | 2 | `/health` and `/api/health` liveness |
| `stats` | 1 | Public platform telemetry aggregation |

**Why real-database tests?** Mocks don't catch Postgres-specific behavior — constraint violations (`23505`), `COUNT(*) FILTER` syntax, `IS NULL` atomicity in concurrent claims, or connection pool crash recovery. Sequential execution (`fileParallelism: false`) prevents connection contention against serverless Neon.

<br />

## 📁 Project Structure

```
clicku-url/
├── backend/
│   ├── src/
│   │   ├── config/        # Zod-validated env vars — fail-fast on boot
│   │   ├── db/            # Drizzle schemas, pg pool, 6 SQL migrations
│   │   ├── lib/           # Crypto, JWT, logger, rate limiters, error classes
│   │   ├── middleware/     # Auth guard, error handler, request-id correlation
│   │   ├── modules/       # auth · url · stats — controller/service/schema/routes each
│   │   ├── routes/        # Public redirect engine (/:slug)
│   │   └── types/         # Express namespace extensions
│   ├── tests/             # 9 suites, 86 tests (Vitest + Supertest)
│   ├── Dockerfile         # Node 22 Alpine
│   └── docker-compose.yml # PostgreSQL 16 + backend
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios + JWT interceptor + 401 auto-logout
│   │   ├── components/    # Dashboard, landing, layout, shared UI
│   │   ├── features/      # auth · urls — API clients, Zod schemas, types
│   │   ├── hooks/         # useTheme, useDebounce, useScrollReveal, useToast
│   │   ├── pages/         # 6 pages: Landing, Login, Register, Dashboard, Deactivated, ComingSoon
│   │   ├── routes/        # AppRoutes + ProtectedRoute (JWT expiry guard)
│   │   └── context/       # Toast system with undo action support
│   └── vercel.json        # 4-tier edge reverse proxy
├── docs/images/           # Product screenshots
└── README.md
```

<br />

## 🗺️ Roadmap

- [x] **v0.4** — Live MVP: auth, URL shortening, redirect engine, React 19 dashboard
- [x] **v0.5** — Landing page rebuild, guest demo shortener, anonymous link claiming (PLG funnel)
- [x] **v0.6** — Vanity aliases, server-side query engine, pinning, RFC 9110 tombstones, hardware-aware touch UX
- [ ] **v0.7** — Analytics studio: geo-location, device breakdowns, UTM campaign tracking, downloadable QR codes
- [ ] **v0.8** — Custom branded domains (CNAME + auto-SSL), developer API keys, webhook events
- [ ] **v0.9** — Team workspaces, RBAC, HttpOnly secure cookie migration
- [ ] **v1.0** — Enterprise readiness: Redis edge caching, SSO/SAML, SLA guarantees

<br />

## 📄 License

Proprietary — all rights reserved.
© 2026 [Harsh Katare](https://github.com/Harshkatare).

<br />

## 👤 Author

<a href="https://github.com/Harshkatare">
  <img src="https://img.shields.io/badge/GitHub-Harshkatare-181717?style=flat-square&logo=github" alt="GitHub" />
</a>
<a href="https://linkedin.com/in/harshkatare">
  <img src="https://img.shields.io/badge/LinkedIn-harshkatare-0A66C2?style=flat-square&logo=linkedin" alt="LinkedIn" />
</a>
<a href="https://shortlynk.in">
  <img src="https://img.shields.io/badge/Product-shortlynk.in-10B981?style=flat-square&logo=safari&logoColor=white" alt="Shortlynk" />
</a>
