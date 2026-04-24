---
description: Interactive planning for a new web app or a major new feature — runs product-research, picks a stack, drafts the data model + API contract, then commits PRODUCT-BRIEF.md + STACK.md + SCHEMA.md + API.md as the project's ground-truth documents. Use at the start of any non-trivial web app project or when scope is drifting and you need to re-anchor. Produces artefacts that every downstream agent reads.
---

# Plan

Structured pre-build planning for a web app. Produces four committed artefacts:

1. `PRODUCT-BRIEF.md` — the user, problem, feature scope
2. `STACK.md` — the chosen frontend + backend + DB + deploy target
3. `SCHEMA.md` — the data model
4. `API.md` — the endpoint contract

Each one is a gate: the next step doesn't start until the prior is committed.

## Flow

### Step 1 — Product brief
Dispatch `product-research`. Interview the user on problem / audience / scope. Draft `PRODUCT-BRIEF.md`. Wait for user sign-off before committing.

### Step 2 — Stack selection
Present common stack templates, let user pick:

| Preset | Frontend | Backend | DB | Deploy |
|---|---|---|---|---|
| **Simple TS** | React + Vite | Hono + TS | Postgres (Neon) | Vercel + Fly |
| **Next full-stack** | Next.js App Router | Next.js Route Handlers | Postgres (Neon) | Vercel |
| **Python** | React + Vite | FastAPI | Postgres (Neon) | Vercel + Fly |
| **Go** | React + Vite | Go + Chi | Postgres (Neon) | Vercel + Fly |
| **SvelteKit** | SvelteKit | SvelteKit endpoints | Postgres (Neon) | Vercel |
| **Custom** | *user-specified* | *user-specified* | *user-specified* | *user-specified* |

User can override any field. Write `STACK.md` with the final choices. Commit.

### Step 3 — Schema
Dispatch `data-model` (reads PRODUCT-BRIEF + STACK). Draft `SCHEMA.md`. Generate the initial migration in the chosen ORM's format. Wait for user sign-off. Commit.

### Step 4 — API
Dispatch `api-design` (reads PRODUCT-BRIEF + SCHEMA). Draft `API.md`. Wait for user sign-off. Commit.

### Step 5 — Handoff
Print: "Ready to build. Run `/webapp-freedom:scaffold` to create the project skeleton, then `/webapp-freedom:endpoint` and `/webapp-freedom:page` for each feature."

## Re-planning (mid-project)

If invoked on an existing project with committed artefacts:
- Read current state
- Identify what's drifted (feature added but API.md doesn't reflect it; schema changed without brief update)
- Propose minimum-viable realignment
- Don't rewrite unless user explicitly wants to

## Anti-patterns

- ❌ Committing `STACK.md` before `PRODUCT-BRIEF.md` is signed off (stack decisions depend on requirements)
- ❌ Skipping user sign-off at gates — this is where implementation rework originates
- ❌ Inventing stack preferences the user didn't choose
- ❌ Writing `API.md` before `SCHEMA.md` — the API is shaped by the data
