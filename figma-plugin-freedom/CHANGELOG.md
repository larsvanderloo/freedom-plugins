# Changelog

## [0.1.0] — 2026-04-24 (initial release)

Initial release of `figma-plugin-freedom`, a Claude Code plugin for building Figma plugins.

### Ships

- **4 agents:**
  - `figma-api-research` — Plugin API / REST API / Webhooks capability research with code sketches
  - `manifest-specialist` — minimum-privilege manifest management + Community-audit readiness
  - `plugin-runtime` — main-thread `code.ts` — node manipulation, selection, async ops
  - `iframe-ui` — UI iframe — postMessage client, Figma visual conventions, dark-mode

- **5 skills** (namespaced `/figma-plugin-freedom:<name>`):
  - `scaffold` — new plugin project skeleton
  - `add-command` — wire a command end-to-end (manifest + handler + UI + types)
  - `postmessage` — generate typed main↔UI message contract
  - `test-locally` — generate Figma-specific manual QA checklist
  - `publish-community` — pre-submission audit + listing copy + asset briefs

- README, LICENSE (MIT), CHANGELOG

### Designed to compose with

- `studio` for session overlay (handoff docs, CHANGELOG, rollback-as-release)

### Not yet included

- Hooks (planned for v0.2.0): PostToolUse on `manifest.json` edit → validate schema
- Example plugin in `examples/` (planned for v0.2.0)
- `analytics-agent` for instrumented plugins (planned)
- Auto-generation of TypeScript types from manifest parameters (planned)
