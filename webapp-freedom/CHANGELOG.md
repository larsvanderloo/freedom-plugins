# Changelog

## [0.1.0] — 2026-04-24 (initial release)

Initial release of `webapp-freedom`, a Claude Code plugin for full-stack web app development.

### Ships

- **4 agents:**
  - `product-research` — upstream thinker; writes PRODUCT-BRIEF.md
  - `data-model` — schema + migration writer, stack-aware ORM output
  - `api-design` — REST or GraphQL contract, error envelope, pagination, auth
  - `impl-agent` — end-to-end feature implementer (backend + frontend against contracts)

- **5 skills** (namespaced `/webapp-freedom:<name>`):
  - `plan` — interactive brief → stack → schema → API contract
  - `scaffold` — runnable project skeleton per chosen stack
  - `endpoint` — add an API endpoint end-to-end (+ test + type regen)
  - `page` — add a frontend route end-to-end (loading/error/empty states)
  - `deploy` — pre-deploy audit + deploy

- Supports 5+1 stack presets (React+Vite+Hono, Next.js, FastAPI, Go+Chi, SvelteKit, custom)
- README, LICENSE (MIT), CHANGELOG

### Designed to compose with

- `session-discipline` for session overlay (highly recommended)

### Not yet included

- `e2e-qa-agent` + `/webapp-freedom:e2e` skill for Playwright/Cypress flows (planned v0.2.0)
- Hooks (planned): PostToolUse on `Edit package.json` → install suggestion; on `Edit schema.prisma` → generate client
- Example app in `examples/` (planned v0.2.0)
- First-class MCP integration for database queries during planning
