# ClickU

A production-oriented URL shortening backend built with TypeScript, Express, PostgreSQL, Drizzle ORM, and Docker.

ClickU allows authenticated users to create, manage, and track shortened URLs while following production-minded backend practices such as validation, authorization, structured logging, rate limiting, environment validation, and containerized deployment.

---

# Features

## Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes
* Current user endpoint

## URL Management

* Create short URLs
* Get all URLs belonging to the authenticated user
* Update URLs
* Delete URLs
* Query-level ownership enforcement

## Redirect System

* Redirect short URLs to original URLs
* Automatic click tracking
* Collision-resistant short code generation

## Analytics

* Total click count tracking per URL

## Security & Reliability

* Request validation with Zod
* Environment variable validation
* Semantic error architecture
* Authentication & authorization
* API rate limiting
* Production-ready CORS configuration

## Observability

* Structured logging with Pino
* Request logging
* Request IDs
* Graceful shutdown
* Async crash handling

## Infrastructure

* PostgreSQL database
* Drizzle ORM
* Dockerized PostgreSQL
* Dockerized backend
* Production build pipeline

---

# Architecture

```text
Client
   ↓
Express Routes
   ↓
Controllers
   ↓
Services
   ↓
Drizzle ORM
   ↓
PostgreSQL
```

## Layer Responsibilities

### Routes

* Define API endpoints
* Apply middleware
* Forward requests to controllers

### Controllers

* Handle HTTP requests and responses
* Validate incoming data
* Delegate business logic to services

### Services

* Contain business logic
* Execute database operations
* Enforce application rules

### Drizzle ORM

* Type-safe database access
* Query building
* Schema management

### PostgreSQL

* Persistent data storage

---

## Architecture Highlights

* Modular feature-based architecture
* Query-level ownership enforcement
* Semantic operational error architecture
* Request correlation IDs
* Structured request logging
* Graceful shutdown handling
* Environment variable validation
* Production-ready CORS configuration
* Collision-resistant short code generation
* Dockerized application infrastructure

---

# Tech Stack

## Backend

* Node.js
* TypeScript
* Express

## Database

* PostgreSQL
* Drizzle ORM

## Validation

* Zod

## Authentication & Security

* JWT Authentication
* Secure password hashing using Node.js `crypto.scrypt`

## Logging

* Pino
* Pino HTTP

## Infrastructure

* Docker
* Docker Compose

---

# Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── db/
│   │   ├── migrations/
│   │   └── schema/
│   ├── lib/
│   │   ├── errors/
│   │   └── rate-limit/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   └── url/
│   ├── routes/
│   ├── types/
│   └── utils/
│
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

---

# Environment Variables

Create a `.env` file using `.env.example`.

```env
PORT=5000

DATABASE_URL=

JWT_SECRET=

CLIENT_URL=
```

Example:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clicku_db

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

# Installation

Install dependencies:

```bash
pnpm install
```

---

# Database Setup

Generate migrations:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

---

# Local Development

Start PostgreSQL:

```bash
docker compose up postgres
```

Start backend:

```bash
pnpm dev
```

---

# Production Build

Build application:

```bash
pnpm build
```

Run production server:

```bash
pnpm start
```

---

# Docker

Build containers:

```bash
docker compose build
```

Start all services:

```bash
docker compose up
```

Start backend only:

```bash
docker compose up backend
```

Start PostgreSQL only:

```bash
docker compose up postgres
```

---

# Health Check

Endpoint:

```http
GET /health
```

Response:

```json
{
  "success": true,
  "message": "server is running"
}
```

---

# API Endpoints

## Authentication

```http
POST /api/v1/auth/register
```

```http
POST /api/v1/auth/login
```

```http
GET /api/v1/auth/me
```

---

## URLs

```http
POST /api/v1/urls
```

```http
GET /api/v1/urls
```

```http
PATCH /api/v1/urls/:id
```

```http
DELETE /api/v1/urls/:id
```

---

## Redirect

```http
GET /:shortCode
```

---

# Project Status

## Completed

* Authentication & Authorization
* URL Shortening
* URL Management
* URL Redirection
* Click Tracking
* Query-Level Ownership Enforcement
* Input Validation
* Semantic Error Handling
* Environment Validation
* Rate Limiting
* Structured Logging
* Request IDs
* Graceful Shutdown
* Async Crash Handling
* Production CORS Configuration
* Dockerized PostgreSQL
* Dockerized Backend
* Production Build Pipeline
* Production Containerization

## Planned

* Frontend Application
* Advanced Analytics
* Multi-Environment Deployment Workflow
* Cloud Deployment
* CI/CD Pipeline

---

# Learning Goals

This project is being built with a focus on learning real-world backend engineering concepts, including:

* Layered architecture
* Authentication & authorization
* Database design
* API security
* Validation strategies
* Observability
* Docker & containerization
* Deployment preparation
* Production-oriented backend practices
