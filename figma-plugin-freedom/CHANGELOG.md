# Changelog

## [0.1.2] — 2026-04-25 (domain-isolation contract)

### What changed

- Added `CLAUDE.md` declaring this plugin's domain (Figma plugins) and a contract not to import Figma analogies into non-Figma work when this repo is open.
- Suite-level: `scripts/check-domain-isolation.sh` enforces the marker presence; called from `release-plugin.sh` as a pre-flight gate.

### Why

Suite BACKLOG.md FEAT-7 — born from a real bleed incident on 2026-04-25 in which JUCE/DSP context leaked into a Figma layout answer. Each `*-freedom` plugin now ships an explicit scope boundary.

### Files

- `CLAUDE.md` (new)
- `.claude-plugin/plugin.json` — version bump

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
