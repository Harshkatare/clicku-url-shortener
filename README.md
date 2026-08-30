# Shortlynk (ClickU)

[![Live Demo](https://img.shields.io/badge/Live_App-shortlynk.in-10B981?style=for-the-badge&logo=safari&logoColor=white)](https://shortlynk.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-17_Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

> 🌐 **Live Production Application:** [https://shortlynk.in](https://shortlynk.in)  
> ⚡ **Architecture:** React 19 (Vercel) + Express 5 (Render) + PostgreSQL 16 (Neon DB)

A modern, production-oriented fullstack URL shortener built with TypeScript, Express 5, PostgreSQL, Drizzle ORM, Docker, React 19, and Tailwind CSS v4.

Shortlynk allows authenticated users to create, manage, and track shortened URLs with real-time click counters, 1-click clipboard sharing, and atomic redirect telemetry.

---

## 🚀 Live Features

### 📊 Product Analytics Baseline (v0.4.8)
* **Vercel Web Analytics Integration:** Real-time web traffic, unique visitor counts, and pageview telemetry via `@vercel/analytics`
* **Performance Telemetry:** Core Web Vitals speed monitoring across all public and authenticated routes
* **Privacy-First Architecture:** 100% GDPR compliant with zero cookies and automatic local development auto-disable

### 🌓 Dark Mode & Design System Infrastructure (v0.4.7)
* **Tailwind CSS v4 Dark Mode Engine:** Class-based `@variant dark` architecture with instant reactive theme toggling
* **Reactive `useTheme` Hook:** Custom React hook with `localStorage` persistence and automatic `prefers-color-scheme` OS detection
* **Theme Switches Across Navbars:** Sun/Moon toggle buttons integrated into `LandingNavbar` and `Navbar` with smooth micro-interactions
* **Design System Utility Suite:** Ported 20+ custom design tokens (`.glass`, `.card-hover`, `.hero-grid`, `.progress-bar`, `.skeleton`, `[data-tooltip]`, `.bg-grid`)
* **Tailwind v4 `@theme` Keyframes:** 8 custom animation keyframes (`fadeIn`, `slideUp`, `slideDown`, `scaleIn`, `bounceIn`, `spinSlow`, `pulseSoft`, `wiggle`)
* **Staggered Scroll Reveals:** Custom `useScrollReveal` hook powered by `IntersectionObserver`
* **High-Contrast Surface Theme Alignment:** Complete dark slate surfaces (`#020617` / `#0f172a`) across Landing, Dashboard, Login, and Register

### 🛡️ Frontend Resilience, Identity & UX (v0.4.6)
* **Instant Auto-Login:** User registration automatically saves JWT tokens and routes directly to `/dashboard`
* **Real-Time Error Alerts:** Type-safe `axios.isAxiosError` error handling displaying specific server responses in auth forms
* **User Identity Header:** Authenticated user's name and email profile badge displayed dynamically in the navbar via `GET /api/v1/auth/me`
* **JWT Expiration Navigation Guard:** Automated client-side token lifetime check in `ProtectedRoute.tsx` with smooth session purge
* **Universal Clipboard Fallback:** Dual-layer clipboard copy utility using `document.execCommand('copy')` ensuring 100% copy success on all devices and local networks
* **React Crash Recovery:** Global `ErrorBoundary` shell preventing blank white-screen crashes with a 1-click **"Reload Application"** recovery card
* **Smart Network Retry Telemetry:** `QueryClient` retry guards disabling redundant retries on 401/404 errors and preventing duplicate link creation
* **Test Suite Expansion:** Automated integration test suite expanded with empty PATCH payload validation (17/17 passing tests)

### 🛡️ Schema & Security Hardening (v0.4.5)
* **Catch-All 404 JSON Handler:** Consistent `{ success: false, message: "Route not found" }` error envelope preventing raw HTML leaks on unmatched routes
* **DoS Payload Guard:** Strict 10kb body parser limit (`express.json({ limit: '10kb' })`) protecting against memory-exhaustion floods
* **Full Error Observability:** Structured Pino logging (`logger.error`) across all 4xx validation and domain error branches with correlation request IDs
* **Schema Foundations:** Added `role` (`'user' | 'admin'`), `is_active`, and `updated_at` columns to the PostgreSQL `users` table
* **Configuration Reference:** Self-documenting `.env.example` templates for local developer setup

### 🌐 Edge Reverse Proxy Routing (v0.4.4)
* Root-domain short URLs (`https://shortlynk.in/:shortCode`) proxied directly at Vercel's edge network to the Render backend redirect engine
* Seamless HTTP 302 redirects with atomic SQL click telemetry without exposing raw backend hosting domains
* Clean dashboard visual URL presentation (`shortlynk.in/a8X9q2`) with RFC-compliant clipboard copy

### 🌐 Public Landing Page & Identity (v0.4.3)
* Modern public-facing landing page with interactive demo link preview card
* Smart authentication guard: automatically redirects authenticated visitors from `/` to `/dashboard`
* Brand identity with vector SVG logo integrated across navbar, landing page, and authentication forms
* 4-stat metrics overview and responsive 3-card feature grid

### 🔐 Authentication & Security
* User registration (`/signup`) and secure login (`/login`)
* JWT-based authentication with 7-day expiration
* Scrypt password hashing with 16-byte random salt and `timingSafeEqual` comparison
* Protected API routes and client-side authenticated navigation guards
* Route-tier and global API rate limiting with `express-rate-limit`
* Axios 401 response auto-logout interceptor (`v0.4.2`)

### 🔗 URL Management & Redirects
* 6-character collision-resistant short codes ($62^6 \approx 56.8\text{B}$ combinations)
* Protected URL listing, creation, updating, and deletion
* Query-level database ownership enforcement (`urls.id = :id AND urls.userId = :userId`)
* Public redirect (`GET /:shortCode`) with atomic SQL click increments (`clicks + 1`)
* Unique constraint collision retry handling (`23505`) with 5x loop (`v0.4.1`)
* UUID route parameter validation with Zod (`urlParamsSchema`, `v0.4.1`)

### 💻 Frontend Dashboard
* Built with React 19, Vite 8, TypeScript, and Tailwind CSS v4
* TanStack React Query v5 for server state with automatic cache invalidation
* React Hook Form with Zod schema validation
* 1-click clipboard copy utility with temporary feedback state
* Responsive layout and self-dismissing alerts
* Deployed on Vercel with SPA routing rewrite configuration

### 🛡️ Observability & Infrastructure
* Structured JSON logging via Pino and Pino-HTTP
* Request correlation IDs (`X-Request-ID` in response headers)
* Centralized semantic error handling (`AppError` hierarchy)
* Graceful process lifecycle management (`SIGINT`, `SIGTERM`, unhandled rejections)
* Automated integration test suite with Vitest and Supertest (17/17 tests passing, `v0.4.6`)
* Dockerized PostgreSQL and multi-container Docker Compose orchestration

---

## 📐 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (React 19 + Vite 8)                │
│   - Tailwind CSS v4, TanStack Query v5, React Router v7     │
│   - Hosted / Deployed on Vercel                             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Axios + Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express 5 + Node 22)              │
│   - TypeScript (NodeNext / ES2022)                          │
│   - Rate Limiting, Helmet, CORS, Request Correlation IDs    │
│   - Centralized AppError Semantic Error Flow & Pino Logging │
└──────────────────────────────┬──────────────────────────────┘
                               │ Drizzle ORM (node-postgres Pool)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 Database                    │
│   - users table (UUID PK, email UK, role, is_active, ts)    │
│   - urls table (UUID PK, FK users cascade, short_code UK)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Backend:** Node.js 22, Express 5, TypeScript, Zod, Drizzle ORM, Pino
* **Database:** PostgreSQL 16 (Docker)
* **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS v4, TanStack Query v5, React Hook Form, React Router v7
* **Deployment & Containers:** Docker, Docker Compose, Vercel

---

## 📁 Project Structure

```text
clicku-url/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variable validation (Zod)
│   │   ├── db/              # Drizzle ORM schemas & migrations
│   │   ├── lib/             # Crypto, tokens, logger, rate-limit, errors
│   │   ├── middleware/      # Auth, error handling, request-id
│   │   ├── modules/         # Auth and URL controllers, services, schemas, routes
│   │   ├── routes/          # Public redirect routes
│   │   └── types/           # Express namespace typing extensions
│   ├── tests/               # Vitest + Supertest integration test suites
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── public/              # Brand SVG logo, favicon
│   ├── src/
│   │   ├── api/             # Axios client & request interceptors
│   │   ├── components/      # Shared UI (Alert, Navbar, LandingNavbar, PageContainer)
│   │   ├── config/          # Client environment validation
│   │   ├── features/        # Auth & URL feature queries, mutations, schemas, types
│   │   ├── layouts/         # AuthLayout, DashboardLayout, LandingLayout shells
│   │   ├── pages/           # HomePage (Landing), LoginPage, RegisterPage, DashboardPage
│   │   └── routes/          # AppRoutes and ProtectedRoute guard
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clicku_db
JWT_SECRET=your_jwt_super_secret_key_12345
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SHORT_URL_BASE=http://localhost:5000
```

---

## 🚀 Getting Started

### 1. Start PostgreSQL
```bash
cd backend
docker compose up postgres -d
```

### 2. Run Database Migrations
```bash
# In backend/
pnpm db:migrate
```

### 3. Start Backend Server
```bash
# In backend/
pnpm dev
# Server listens on http://localhost:5000
```

### 4. Start Frontend Client
```bash
# In frontend/
pnpm dev
# Client runs on http://localhost:5173
```

### 5. Run Automated Tests
```bash
# In backend/
pnpm test

# Run in watch mode during development
pnpm test:watch
```

---

## 🔌 API Endpoints Reference

### Health & Redirects
* `GET /health` — Server liveness & health check
* `GET /:shortCode` — Public redirect to destination with atomic click increment

### Authentication (`/api/v1/auth`)
* `POST /api/v1/auth/signup` — Register new user account
* `POST /api/v1/auth/login` — Authenticate and receive JWT token
* `GET /api/v1/auth/me` — Retrieve current user profile (Protected)

### URLs (`/api/v1/urls`)
* `POST /api/v1/urls` — Create a new shortened link (Protected)
* `GET /api/v1/urls` — List all links for authenticated user (Protected)
* `PATCH /api/v1/urls/:id` — Update link destination URL (Protected)
* `DELETE /api/v1/urls/:id` — Delete a shortened link (Protected)

---

### 📌 Project Status & Roadmap

### ✅ Completed (v0.4.0 Live MVP)
* End-to-end user authentication & authorization
* URL creation, atomic click tracking, and redirection
* Query-level authorization enforcement
* Structured logging & request correlation IDs
* React 19 Frontend Dashboard with TanStack Query
* Dockerized backend and PostgreSQL
* Production Vercel deployment

### ✅ Completed (v0.4.1 Backend Hardening & Testing)
* Centralized error handling unification through Pino `logger.error`
* Route parameter UUID validation with Zod (`urlParamsSchema`)
* Unique constraint collision retry handling (`23505`) with 5x loop
* Automated integration test suite (Vitest + Supertest, 16/16 tests passing)

### ✅ Completed (v0.4.2 Frontend Client Resilience)
* Axios 401 response auto-logout interceptor
* Strict TypeScript generic return types (`AuthResponse`)

### ✅ Completed (v0.4.3 Landing Page & Product Identity)
* Public-facing landing page with interactive demo link preview
* Smart authentication guard (Gap #24) routing logged-in users from `/` to `/dashboard`
* Shortlynk branding and vector SVG logo integrated across the application
* Modern sticky `LandingNavbar` and standalone `LandingLayout`

### ✅ Completed (v0.4.4 Edge Reverse Proxy Routing)
* Vercel edge reverse proxy configuration (`vercel.json`) proxying Base62 6-character shortcodes to Render backend
* Root custom domain short link resolution (`shortlynk.in/:shortcode`)
* Dashboard short URL visual display styling and clipboard copy alignment

### ✅ Completed (v0.4.5 Schema & Security Hardening)
* Catch-all 404 JSON response handler on backend (`{ success: false, message: "Route not found" }`)
* 10kb body payload protection against DoS floods (`express.json({ limit: '10kb' })`)
* Structured Pino error logging across all 4xx client and validation error paths with request IDs
* Database schema foundations (`role`, `is_active`, `updated_at` on `users` table) with Drizzle migration
* Comprehensive `.env.example` templates for backend and frontend developer onboarding

### ✅ Completed (v0.4.6 Frontend Resilience & Test Expansion)
* User registration auto-login persistence and direct dashboard routing (`RegisterPage.tsx`)
* Type-safe `axios.isAxiosError` dynamic server error messages in login and signup forms
* Authenticated user identity display (name & email) in dashboard navbar via `GET /api/v1/auth/me`
* Client-side JWT `exp` timestamp validation and auto-purge redirect guard in `ProtectedRoute.tsx`
* Full URL domain feature parity (`updateUrl()` API client, Zod schema, and `userId` type interface)
* Universal clipboard fallback utility using `document.execCommand('copy')` for non-HTTPS environments
* Global React `ErrorBoundary` crash recovery shell with 1-click reload recovery
* TanStack `QueryClient` retry guards (disabled retries on 401/404 errors and mutations)
* Automated integration test expansion for empty PATCH payload validation (17/17 tests passing)
* Workspace package manifests updated to `0.4.6` with production metadata and ATS-optimized keywords

### ✅ Completed (v0.4.7 Dark Mode & Design System Infrastructure)
* Tailwind CSS v4 class-based dark mode engine (`@variant dark`) with instant reactive theme toggling
* Custom `useTheme` hook with `localStorage` persistence and automatic OS color-scheme preference fallback
* Sun/Moon theme toggle switches integrated into `LandingNavbar` and `Navbar` with smooth micro-interactions
* 20+ custom design system utility classes (`.glass`, `.card-hover`, `.hero-grid`, `.progress-bar`, `.skeleton`, `[data-tooltip]`, `.bg-grid`)
* 8 custom `@theme` keyframe animations (`fadeIn`, `slideUp`, `slideDown`, `scaleIn`, `bounceIn`, `spinSlow`, `pulseSoft`, `wiggle`)
* `useScrollReveal` hook powered by `IntersectionObserver` for staggered scroll animations
* Complete dark slate surface styling (`#020617` / `#0f172a`) across Landing, Dashboard, Login, and Register pages
* Workspace package manifests aligned to version `0.4.7`

### ✅ Completed (v0.4.8 Product Analytics Baseline)
* Vercel Web Analytics client integrated into React 19 root application tree
* Real-time visitor, pageview, referrer, and Core Web Vitals performance tracking enabled on `shortlynk.in`
* Privacy-first, zero-cookie telemetry architecture with automatic local dev exclusion
* Workspace package manifests aligned to version `0.4.8`

