# ClickU

A modern, production-oriented fullstack URL shortener built with TypeScript, Express 5, PostgreSQL, Drizzle ORM, Docker, React 19, and Tailwind CSS v4.

ClickU allows authenticated users to create, manage, and track shortened URLs with real-time click counters, 1-click clipboard sharing, and atomic redirect telemetry.

---

## 🚀 Live Features (v0.4.0 MVP)

### 🔐 Authentication & Security
* User registration (`/signup`) and secure login (`/login`)
* JWT-based authentication with 7-day expiration
* Scrypt password hashing with 16-byte random salt and `timingSafeEqual` comparison
* Protected API routes and client-side authenticated navigation guards
* Route-tier and global API rate limiting with `express-rate-limit`

### 🔗 URL Management & Redirects
* 6-character collision-resistant short codes ($62^6 \approx 56.8\text{B}$ combinations)
* Protected URL listing, creation, updating, and deletion
* Query-level database ownership enforcement (`urls.id = :id AND urls.userId = :userId`)
* Public redirect (`GET /:shortCode`) with atomic SQL click increments (`clicks + 1`)

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
│   - users table (UUID PK, unique email, scrypt password)   │
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
│   │   ├── middleware/       # Auth, error handling, request-id
│   │   ├── modules/         # Auth and URL controllers, services, schemas, routes
│   │   ├── routes/          # Public redirect routes
│   │   └── types/           # Express namespace typing extensions
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client & request interceptors
│   │   ├── components/      # Shared UI (Alert, Navbar, PageContainer)
│   │   ├── config/          # Client environment validation
│   │   ├── features/        # Auth & URL feature queries, mutations, schemas, types
│   │   ├── layouts/         # AuthLayout and DashboardLayout shells
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage
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

## 📌 Project Status & Roadmap

### ✅ Completed (v0.4.0 Live MVP)
* End-to-end user authentication & authorization
* URL creation, atomic click tracking, and redirection
* Query-level authorization enforcement
* Structured logging & request correlation IDs
* React 19 Frontend Dashboard with TanStack Query
* Dockerized backend and PostgreSQL
* Production Vercel deployment

### ⏳ In Progress (v0.4.1 Stabilization)
* Centralized error handling unification
* Route parameter UUID validation
* Unique constraint collision retry handling (`23505`)
* Frontend 401 response interceptor
* Automated test baseline (Vitest + Supertest)

### 🎯 Planned (v0.5.0 URL Management)
* URL search, filtering, and pagination
* Frontend Edit link modal UI

