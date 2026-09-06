# Shortlynk Frontend (`frontend/`)

[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The client-side Single-Page Application (SPA) for **[Shortlynk](https://shortlynk.in)**. Built with React 19, Tailwind CSS v4, and Vite 8, engineered for high conversion, responsive dark-mode theming, and resilient server-state caching.

---

## 🌟 Key Architecture & Features

* **High-Conversion Public Landing Page:** Hero with interactive public demo shortener, live database platform telemetry strip (`PlatformStatsProof`), technical metrics ribbon (`TechnicalMetricsStrip`), features grid, transparent pricing tiers, animated FAQ accordion, and brand watermark CTA banner.
* **Unified AuthModal Experience:** Tabbed modal overlay (Login / Signup) with Escape key dismissal, Windows scrollbar stabilization, and real-time 4-level password entropy analysis (`PasswordStrengthMeter`).
* **Product-Led Growth (PLG) Demo Claiming:** Automatic claiming of guest-shortened URLs from `sessionStorage` upon authentication (`POST /api/v1/urls/claim`).
* **Tailwind CSS v4 Design System:** `@variant dark` engine with system/manual toggle, custom CSS tokens (`.glass`, `.card-hover`, `.hero-grid`, `.progress-bar`), and 8 keyframe animations.
* **Resilient Server State:** TanStack React Query v5 caching with automatic cache invalidation and smart retry guards (401/404 skip).
* **Fault-Tolerant UX:** Global `ErrorBoundary` crash shell and dual-layer clipboard copy utility with legacy fallback.

---

## 📁 Directory Structure

```text
frontend/src/
├── api/             # Axios client, request/response interceptors & token handlers
├── components/
│   ├── auth/        # AuthModal, PasswordStrengthMeter
│   ├── common/      # Brand Logo, ThemeToggle, Navbar, MobileNavMenu
│   ├── landing/     # HeroSection, PlatformStatsProof, TechnicalMetricsStrip,
│   │                # FeaturesGrid, PricingTiers, FaqAccordion, CtaBanner, Footer
│   ├── Alert.tsx    # Self-dismissing toast alerts
│   └── ErrorBoundary.tsx # Crash recovery shell
├── config/          # Client environment validation (env.ts)
├── features/        # TanStack Query hooks, schemas, API calls (auth, urls)
├── hooks/           # useTheme, useScrollReveal, useAnimateCounter
├── layouts/         # AuthLayout, DashboardLayout
├── pages/           # LandingPage, LoginPage, RegisterPage, DashboardPage
├── routes/          # AppRoutes and ProtectedRoute authentication guard
└── utils/           # Clipboard copy utility with HTTP execCommand fallback
```

---

## 🛠️ Scripts & Development

```bash
# Start Vite development server (http://localhost:5173)
pnpm dev

# Typecheck and production bundle build
pnpm build

# Run ESLint validation
pnpm lint

# Preview production build locally
pnpm preview
```

---

## 🔑 Environment Variables (`.env`)

```env
# Backend API Base URL (must include /api/v1)
VITE_API_URL=http://localhost:5000/api/v1

# Base URL for generated shortlinks in development
VITE_SHORT_URL_BASE=http://localhost:5000
```
