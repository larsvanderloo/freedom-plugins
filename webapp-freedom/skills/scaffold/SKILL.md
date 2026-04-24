---
description: Scaffold a new web app project according to STACK.md. Creates the directory structure, installs dependencies, wires up TypeScript/build/test configs, auth middleware stub, basic routing, and a working "hello" page that round-trips through the backend. Use after /webapp-freedom:plan has committed the planning artefacts. Produces a runnable skeleton in ~5 minutes.
---

# Scaffold

Takes a committed `STACK.md` + `SCHEMA.md` + `API.md` and produces a runnable project skeleton. No guesswork about structure — it's implied by the stack.

## Pre-flight

1. Confirm `STACK.md`, `SCHEMA.md`, `API.md`, `PRODUCT-BRIEF.md` all exist.
2. If any missing, redirect to `/webapp-freedom:plan`.
3. If a project already exists in the current directory, confirm overwrite or abort.

## Per-stack scaffolds

### React + Vite + Hono (separate servers)

```
<project>/
├── packages/
│   ├── frontend/          # Vite + React + TS
│   │   ├── src/
│   │   │   ├── routes/         # file-based routing
│   │   │   ├── components/
│   │   │   ├── api/            # generated client
│   │   │   ├── main.tsx
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   └── package.json
│   ├── backend/           # Hono + TS + Drizzle
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── db/
│   │   │   ├── auth/
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   └── package.json
│   └── types/             # shared DTOs generated from API.md
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
└── README.md
```

### Next.js App Router (monolithic)

```
<project>/
├── app/
│   ├── (public)/login/page.tsx
│   ├── (app)/projects/page.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   └── projects/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/db/                # Drizzle or Prisma
├── lib/auth/
├── components/
├── package.json
└── README.md
```

### Other stacks
- SvelteKit: single app with file-based routing + endpoints
- Python FastAPI + React: separate `backend/` (FastAPI + SQLAlchemy + Alembic) and `frontend/` (Vite + React)
- Go + Chi + React: separate `backend/` (Go) and `frontend/` (Vite + React)

## What gets wired

### Backend
- Server entry + graceful shutdown
- Auth middleware that validates bearer JWT (stub, real impl via `impl-agent`)
- One sample route: `GET /health` → `{ status: 'ok' }`
- DB connection + migration runner
- Request logging
- Error handler producing the API.md error envelope

### Frontend
- Router with at least 2 routes (`/` and `/health-check` that fetches backend `/health`)
- API client with typed fetch wrapper
- Error boundary at the route level
- Base layout + global styles (Tailwind if chosen)
- Dark mode toggle (if chosen in STACK.md)

### Shared
- Shared types package (or equivalent) populated with DTOs from API.md
- `.env.example` listing required env vars

## Post-scaffold output

```
✓ Scaffold complete at <path>
→ Frontend: pnpm --filter frontend dev      (http://localhost:5173)
→ Backend:  pnpm --filter backend dev       (http://localhost:3000)
→ DB:       pnpm --filter backend db:migrate
→ Tests:    pnpm test

Next:
  /webapp-freedom:endpoint <feature>   — add a new API endpoint end-to-end
  /webapp-freedom:page <route>         — add a new frontend route end-to-end
```

## Anti-patterns

- ❌ Scaffolding over an existing non-empty project without confirmation
- ❌ Installing a stack different from STACK.md "because it's what I know"
- ❌ Skipping the health-check round-trip — it's the first smoke test that proves the scaffold works
- ❌ Generating types manually instead of from API.md — they'll drift immediately
