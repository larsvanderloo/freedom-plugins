---
description: Add a new API endpoint end-to-end — route registration, request validation, DB query via ORM, response serialisation per API.md DTO, error handling, unit test, and regenerate the shared types package. Use when implementing a backend feature documented in API.md. Dispatches impl-agent with full contract context.
---

# Endpoint

One-command addition of a new API endpoint. Touches:
- Route file (registration)
- Handler (validation + business logic)
- DB query / ORM call
- Error mapping
- Test
- Shared types (regenerated from API.md)

## Pre-flight

1. Endpoint is documented in `API.md` — if not, redirect to `api-design` first
2. Referenced entities exist in `SCHEMA.md` — if not, redirect to `data-model`
3. Current scaffold is installed (health-check passes)

## Flow

### Step 1 — Confirm the contract

Print the endpoint's API.md entry back to the user so we're aligned:

```
POST /projects
  Auth: required
  Body: { name: string (1-100 chars) }
  201: ProjectDTO
  Errors: 400 VALIDATION_ERROR, 409 PROJECT_NAME_EXISTS
```

If anything is wrong / missing, fix API.md first; don't implement against a broken contract.

### Step 2 — Dispatch `impl-agent`

Invoke with:
- Endpoint spec from API.md
- Stack context from STACK.md
- Schema reference for entities touched

`impl-agent` writes:
- Route registration (per stack convention)
- Handler with input validation (zod / valibot / pydantic / etc.)
- DB query (ORM-based, authorisation-aware: `WHERE owner_id = :currentUser`)
- Response serialisation to the DTO shape
- Error mapping (validation → 400, conflict → 409, not-found → 404)
- Happy-path test + one error-path test

### Step 3 — Regenerate shared types

If using generated types, run the generator. Confirm the new DTO compiles in the shared package.

### Step 4 — Verify

- Run the test suite — new tests pass
- Run the dev server — manual hit the endpoint with curl or the API explorer
- Check the response matches API.md's contract exactly

### Step 5 — Report

```
✓ POST /projects implemented
  - Route: backend/src/routes/projects.ts
  - Handler: createProject (line 42)
  - Test: backend/test/projects.test.ts (3 tests, all pass)
  - DTO: types/src/dtos.ts (ProjectDTO updated)

Next:
  /webapp-freedom:page projects  — frontend that consumes this endpoint
  /webapp-freedom:e2e create-project  — user-flow test
```

## Multi-endpoint batch

If adding 3-5 related endpoints at once (e.g., full CRUD for a resource), do them in sequence as separate dispatches. Don't batch into one `impl-agent` call — each endpoint deserves its own validation + test + review pass.

## Anti-patterns

- ❌ Implementing an endpoint not documented in API.md (contract drift)
- ❌ Skipping the test — "I'll add tests later" never happens
- ❌ Copy-paste from a similar endpoint without reading the new spec
- ❌ Forgetting the authorisation check (`WHERE owner_id = :user`)
- ❌ Returning the DB row directly (exposes internal column names — always serialise to DTO)
