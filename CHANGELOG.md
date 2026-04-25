# Suite Changelog

Suite-level events. Each plugin maintains its own `<plugin>/CHANGELOG.md` for plugin-specific releases.

## [suite] — 2026-04-25 — repo rename: `claude-plugins` → `freedom-plugins`

### What changed

- Repo renamed to align with the `*-freedom` plugin family naming and to drop "Claude" from the name (per project naming convention).
- All plugin `repository` + `homepage` URLs updated from `larsvanderloo/claude-plugins` (and one stray `larsvanderloo/marketing-team-freedom`) → `larsvanderloo/freedom-plugins`.
- Added top-level project management:
  - `README.md` — suite overview, plugin catalog, install instructions, composition examples
  - `CHANGELOG.md` (this file) — suite-level changelog
  - `BACKLOG.md` — cross-plugin FEAT-N items

### Why

Eat-your-own-dogfood: `studio` plugin enforces project-management discipline (CHANGELOG, BACKLOG, handoffs) on whatever repo it operates over. The repo *containing* `studio` was missing those very artefacts. Now corrected.

### Files

- `README.md` (new)
- `CHANGELOG.md` (new)
- `BACKLOG.md` (new)
- `*/.claude-plugin/plugin.json` × 7 — URL updates only (no version bump; URL-only metadata change)

No tag for this suite event — it's repo-level, not plugin-level. Plugin tags (`studio-v0.3.0` et al.) are unaffected.

## [suite] — 2026-04-25 — studio v0.3.0 (MCP server)

`studio` plugin promoted to v0.3.0: now ships a bundled MCP server (`studio-mcp`) with 8 project-state tools. See `studio/CHANGELOG.md` for details. Tagged `studio-v0.3.0`.

## [suite] — 2026-04-25 — Phase B: rename `session-discipline` → `studio`

The project-management plugin renamed from `session-discipline` to `studio`. Skill namespace migrated from `/session-discipline:*` to `/studio:*`. All 6 domain plugins patch-bumped for the cross-reference change. See `studio/CHANGELOG.md` v0.2.0. Tagged `studio-v0.2.0`.

## [suite] — 2026-04-25 — Phase A: subsume `industrial-design-team` into `hardware-product-freedom`

Eliminated overlap between the two hardware-adjacent plugins. `industrial-design-team` removed; `hardware-product-freedom` absorbed its agent set into a unified ID + electronics + ops team. See `hardware-product-freedom/CHANGELOG.md` v0.1.2. Tagged `hardware-product-freedom-v0.1.2`.

## [suite] — 2026-04-24 — initial multi-plugin release

First public commit of the suite. Contains:

- `audio-plugin-freedom` v0.1.1 (JUCE pipeline, distilled from `ods-engine`)
- `hardware-product-freedom` v0.1.1
- `webapp-freedom` v0.1.1
- `cli-tool-freedom` v0.1.1
- `figma-plugin-freedom` v0.1.1
- `marketing-team-freedom` v0.1.1
- `session-discipline` v0.1.1 (later → `studio` v0.2.0)

All plugins extracted from working patterns rather than theoretical scaffolding. The `examples/ods-engine-arc.md` case study (in `studio/`) walks through one complete debug session as a demonstration.
