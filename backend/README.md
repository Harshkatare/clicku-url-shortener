# Shortlynk Backend (`backend/`)

[![Express 5](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Vitest](https://img.shields.io/badge/Tests-28_Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

Production-grade, high-concurrency URL shortening and redirection API for **[Shortlynk](https://shortlynk.in)**. Engineered with Express 5, TypeScript (NodeNext), Drizzle ORM, and PostgreSQL 16.

---

## 🌟 Key Architecture & Subsystems

* **Express 5 Core:** Async route handling with native Promise support, Helmet security headers, CORS origin enforcement, and 10kb DoS payload limit.
* **Collision-Resistant Redirect Engine:** 6-character Base62 short codes ($62^6 \approx 56.8\text{B}$ combinations) with automated unique constraint collision retry handling (5x loop) and atomic SQL click increments (`clicks + 1`).
* **Guest Demo Shortener & PLG Claiming:**
  - `POST /api/v1/urls/demo`: Public rate-limited guest shortening (3 links/IP/24h).
  - `POST /api/v1/urls/claim`: Atomic SQL ownership transfer (`WHERE userId IS NULL`) claiming guest links upon authentication.
* **Observability & Logging:** Structured JSON logging via Pino and Pino-HTTP with request correlation IDs (`X-Request-ID` response headers).
* **Enterprise Security:** Scrypt password hashing with 16-byte random salt and `timingSafeEqual` comparison, 7-day signed JWT tokens, and centralized `AppError` semantic error hierarchy.
* **Integration Test Coverage:** 28 automated integration tests across 7 test suites powered by Vitest and Supertest.

---

## 📁 Directory Structure

```text
backend/src/
├── config/          # Environment variable validation with Zod
├── db/              # Drizzle ORM schema definitions and migrations
├── lib/             # Crypto, tokens, logger, rate-limiters, AppError classes
├── middleware/      # JWT auth guard, request-id injector, centralized error handler
├── modules/
│   ├── auth/        # Auth controller, service, routes, Zod schemas
│   ├── url/         # URL CRUD, demo shortening, link claiming
│   └── stats/       # Platform telemetry and public metrics
├── routes/          # Public redirect router (/:shortCode)
├── types/           # Express namespace typing extensions
└── server.ts        # HTTP server lifecycle and graceful shutdown handling
```

---

## 🛠️ Scripts & Development

```bash
# Start development server with live reload (tsx)
pnpm dev

# Build TypeScript to dist/
pnpm build

# Start production server
pnpm start

# Run all 28 automated integration tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Database schema migrations
pnpm db:generate
pnpm db:migrate
```

---

## 🔑 Environment Variables (`.env`)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shortlynk_db
JWT_SECRET=super_secret_jwt_key_at_least_10_characters_long
CLIENT_URL=http://localhost:5173
```
