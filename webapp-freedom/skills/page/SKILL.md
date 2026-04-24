---
description: Add a new frontend route end-to-end — route registration, data fetching via typed API client, loading/error/empty states, the main component, and any form validation. Use when building a user-facing page that consumes an API endpoint. Dispatches impl-agent with the API.md + STACK.md context. Does NOT design the UI (that's ideation / design territory); it assumes the structure is known.
---

# Page

One-command addition of a new frontend route. Touches:
- Route registration (file-based or explicit)
- Data fetching (TanStack Query / SWR / whatever STACK.md specifies)
- Component with loading / error / empty states
- Optional: form with validation
- Test (render test + one interaction)

## Pre-flight

1. The API endpoints this page consumes exist in `API.md` — list which ones
2. Corresponding backend handlers are implemented — `/webapp-freedom:endpoint` ran for each
3. Shared types are up to date (regenerated from API.md)

## Flow

### Step 1 — Describe the route

Ask (or read from a design doc):
- **URL pattern:** `/projects`, `/projects/:id`, etc.
- **Requires auth:** yes / no (most will be yes)
- **Main query:** which API endpoint is the primary data source?
- **Mutations:** any actions (create/edit/delete) this page supports?

### Step 2 — Dispatch `impl-agent`

Produces:
- Route registration
- Data fetching hook(s) keyed on the endpoint + params
- Main page component
- Subcomponents if obviously needed
- Loading state: skeleton / spinner / "Loading…" per STACK.md conventions
- Error state: user-facing message from the error code mapping
- Empty state: "No projects yet. Create one?" with a clear next action
- Form with validation if mutations are present (zod / react-hook-form / etc.)
- Test: render-test that the page doesn't crash + one happy-path interaction

### Step 3 — Verify

- Run the dev server, manually navigate to the route
- All three async states visible (use devtools to simulate slow network for loading, kill backend for error, empty DB for empty)
- Form validation errors show inline
- Mutations update the list / page without full-page reload

### Step 4 — Report

```
✓ /projects route implemented
  - Route: frontend/src/routes/projects.tsx
  - Data fetch: useProjects() hook wraps GET /projects
  - States: loading (skeleton), error (toast + inline), empty (CTA to create)
  - Mutations: createProject + renameProject (optimistic update enabled)
  - Test: frontend/test/projects.test.tsx (2 tests)

Next:
  /webapp-freedom:e2e view-projects — E2E user-flow test
```

## State-management patterns

- **Server state:** TanStack Query / SWR / RTK Query — always for anything that round-trips the API
- **Form state:** react-hook-form / formik / native controlled — per STACK.md
- **Local UI state:** useState / useReducer
- **Cross-component:** Context for a small app; Zustand / Jotai for anything larger

Don't use a heavy global state library for a small app. Don't stuff server state into Redux.

## Anti-patterns

- ❌ Skipping loading / error / empty states (only happy path ships)
- ❌ Fetching on every render (use the query key correctly)
- ❌ Re-deriving types from the API response instead of using the shared DTO types
- ❌ Inline validation that disagrees with the backend's validation
- ❌ Mutations that don't invalidate or optimistically update the query — list stays stale
