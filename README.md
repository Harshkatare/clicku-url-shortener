# Shortlynk (ClickU)

[![Live Demo](https://img.shields.io/badge/Live_App-shortlynk.in-10B981?style=for-the-badge&logo=safari&logoColor=white)](https://shortlynk.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-16_Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

> 🌐 **Live Production Application:** [https://shortlynk.in](https://shortlynk.in)  
> ⚡ **Architecture:** React 19 (Vercel) + Express 5 (Render) + PostgreSQL 16 (Neon DB)

A modern, production-oriented fullstack URL shortener built with TypeScript, Express 5, PostgreSQL, Drizzle ORM, Docker, React 19, and Tailwind CSS v4.

Shortlynk allows authenticated users to create, manage, and track shortened URLs with real-time click counters, 1-click clipboard sharing, and atomic redirect telemetry.

---

## 🚀 Live Features

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
* Automated integration test suite with Vitest and Supertest (16/16 tests passing, `v0.4.1`)
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

