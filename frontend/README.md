# Shortlynk Frontend (`frontend/`)

[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-0.6.0-blue?style=flat-square)](package.json)

The client-side Single-Page Application (SPA) for **[Shortlynk](https://shortlynk.in)**. Built with React 19, Tailwind CSS v4, and Vite 8, engineered for high conversion, responsive dark-mode theming, and resilient server-state caching.

---

## 🌟 Key Architecture & Features

* **Inlined URL Creation Bar (`CreateUrlBar.tsx`):** Workspace command bar integrating destination URL input and custom vanity alias input on a single card row (`shortlynk.in/` domain badge, inside-right 1-click clipboard paste button, permanent vibrant blue CTA, and localized focus indicators).
* **Sticky Link Pinning & Prioritization:** 1-tap link pinning toggles with optimistic TanStack Query cache updates, dedicated "Pinned" filter chip, and sticky hoisting to the top of the user dashboard.
* **Hardware-Aware Touch Ergonomics (W3C Level 4):** Media query decoupling (`@media (hover: hover) and (pointer: fine)`) exposing action buttons (Pin, QR, Copy, Edit, Delete) permanently on touchscreens and tablets (iPads, Surface devices) while preserving clean hover disclosure on desktop pointer devices.
* **8px Floating Pill Scrollbar Architecture:** Standard W3C and WebKit floating pill scrollbar rules with transparent tracks and dynamic `color-scheme` synchronization in `index.css`, permanently eradicating the native Windows Chromium 17px bright white gutter defect.
* **Decluttered SaaS Canvas & Rich Link Cards:** Calm B2B workspace canvas (`bg-slate-50 dark:bg-slate-950`), rich URL cards (`UrlCard.tsx`) with logarithmic click velocity indicators (`log10`), status badges, and accessible modal editing (`EditUrlModal.tsx`) mounted via React Portals.
* **Search, Filter & Dynamic Sorting:** Debounced search, status filter chips (`All`, `Active`, `Expiring`, `Pinned`, `Archived`), 4-way sorting dropdown (`Newest`, `Oldest`, `Most Clicks`, `Least Clicks`), React Router URL query param sync (`useSearchParams`), and optimistic ghost-page boundary calculations.
* **High-Conversion Public Landing Page:** Hero with interactive public demo shortener, live database platform telemetry strip (`PlatformStatsProof`), technical metrics ribbon (`TechnicalMetricsStrip`), features grid, transparent pricing tiers, animated FAQ accordion, and brand watermark CTA banner.
* **Unified AuthModal Experience & PLG Claiming:** Tabbed modal overlay (Login / Signup) with Escape key dismissal, Windows scrollbar stabilization, real-time 4-level password entropy analysis (`PasswordStrengthMeter`), and automatic claiming of guest-shortened URLs from `sessionStorage` upon authentication (`POST /api/v1/urls/claim`).
* **Optimistic Toast Engine & Undo Buffer:** Global `ToastProvider` context and floating `ToastContainer` with 5-second delayed deletion undo buffer and unmount timer map cleanup.
* **Unreleased Route Protection:** Dedicated `ComingSoonPage.tsx` for `/analytics` and `/settings` with universal catch-all routing fallback.
* **Tailwind CSS v4 Design System:** `@variant dark` engine with system/manual toggle, custom CSS tokens (`.glass`, `.card-hover`, `.progress-bar`), and 8 keyframe animations.
* **Fault-Tolerant UX:** Global `ErrorBoundary` crash recovery shell and dual-layer clipboard copy utility with legacy fallback.

---

## 📁 Directory Structure

```text
frontend/src/
├── api/             # Axios client, request/response interceptors & token handlers
├── components/
│   ├── auth/        # AuthModal, PasswordStrengthMeter
│   ├── common/      # Brand Logo, ThemeToggle, Navbar, MobileNavMenu, ToastContainer
│   ├── dashboard/   # CreateUrlBar, UrlCard, UrlToolbar, PaginationControls,
│   │                # StatCards, EditUrlModal
│   ├── landing/     # HeroSection, PlatformStatsProof, TechnicalMetricsStrip,
│   │                # FeaturesGrid, PricingTiers, FaqAccordion, CtaBanner, Footer
│   ├── layout/      # AppShell navigation header
│   └── ErrorBoundary.tsx # Crash recovery shell
├── config/          # Client environment validation (env.ts)
├── context/         # ToastContext & ToastProvider
├── features/        # TanStack Query hooks, schemas, API calls (auth, urls)
├── hooks/           # useTheme, useDebounce, useToast, useScrollReveal, useAnimateCounter
├── layouts/         # AuthLayout, DashboardLayout
├── pages/           # LandingPage, LoginPage, RegisterPage, DashboardPage,
│                    # DeactivatedPage, ComingSoonPage
├── routes/          # AppRoutes and ProtectedRoute authentication guard
├── types/           # Client TypeScript declarations (toast.types.ts)
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
