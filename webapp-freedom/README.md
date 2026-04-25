# webapp-freedom

Claude Code plugin for full-stack web app development. Four agents + five skills that take a project from "we want to build an app" to "we shipped it", with committed contracts at each gate so implementation can parallelise.

Stack-agnostic — pick frontend + backend + DB at `plan` time, remembered in `STACK.md`. Designed to layer on [`studio`](../studio) for the session overlay.

## Install

```bash
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/studio \
  --plugin-dir ~/Documents/Claude/claude-plugins/webapp-freedom
```

## Quick start

```
/webapp-freedom:plan
```

Walks you through: product brief → stack selection → schema → API contract. Commits four artefacts: `PRODUCT-BRIEF.md`, `STACK.md`, `SCHEMA.md`, `API.md`. After that:

```
/webapp-freedom:scaffold     # create the runnable skeleton
/webapp-freedom:endpoint     # add an API endpoint end-to-end
/webapp-freedom:page         # add a frontend route end-to-end
/webapp-freedom:deploy       # pre-deploy audit + deploy
```

## Agents

| Agent | Role |
|---|---|
| `product-research` | Upstream — user, JTBD, scope. Writes `PRODUCT-BRIEF.md` every other agent reads. |
| `data-model` | Schema design, migrations, indexes. Writes `SCHEMA.md` + initial migration for the chosen ORM. |
| `api-design` | Endpoints, DTOs, auth, error contract. Writes `API.md` as frontend/backend contract. |
| `impl-agent` | Builds features end-to-end — backend handler + DB query + frontend route + component + test. Reads `STACK.md` to know the stack. |

## Skills (`/webapp-freedom:<name>`)

| Skill | What it does |
|---|---|
| `plan` | Interactive planning — brief → stack → schema → API contract |
| `scaffold` | Runnable project skeleton per `STACK.md` |
| `endpoint` | Add a new API endpoint end-to-end (handler + query + test + types regen) |
| `page` | Add a new frontend route end-to-end (route + data-fetch + states + test) |
| `deploy` | Pre-deploy audit + deploy (Vercel/Fly/Railway/self-hosted) |

## Supported stack presets (pick at `/plan` time)

| Preset | Frontend | Backend | DB | Deploy |
|---|---|---|---|---|
| Simple TS | React + Vite | Hono + TS | Postgres (Neon) | Vercel + Fly |
| Next full-stack | Next.js App Router | Next.js Route Handlers | Postgres (Neon) | Vercel |
| Python | React + Vite | FastAPI | Postgres (Neon) | Vercel + Fly |
| Go | React + Vite | Go + Chi | Postgres (Neon) | Vercel + Fly |
| SvelteKit | SvelteKit | SvelteKit endpoints | Postgres (Neon) | Vercel |
| Custom | *user-specified on any axis* | | | |

Any preset can be overridden per-field.

## Philosophy

- **Contracts before code.** PRODUCT-BRIEF.md → STACK.md → SCHEMA.md → API.md, each a gate. Implementation doesn't start until contracts are signed off.
- **Types travel.** DTOs from API.md are generated into a shared package. Frontend and backend see identical types.
- **Every feature has a test.** Not perfect test coverage, but the happy path and one error path, always, with the feature.
- **Migrations are forward-only.** Never edit a prior migration. Reversibility documented explicitly.
- **Deploys are audited.** `/deploy` runs a pre-flight before shipping. Rollback plan documented.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md) for the full plugin collection.
