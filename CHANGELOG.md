# Suite Changelog

Suite-level events. Each plugin maintains its own `<plugin>/CHANGELOG.md` for plugin-specific releases.

## [suite] — 2026-04-25 — FEAT-7 closed: domain-isolation contract across `*-freedom` plugins

### What changed

- Added `CLAUDE.md` to each of the 6 `*-freedom` plugins declaring its domain scope and a contract not to import its analogies into other-domain work when this repo is open. `studio` excluded — domain-agnostic by design.
- Added `scripts/check-domain-isolation.sh` — verifies every `*-freedom` plugin has a `CLAUDE.md` containing the marker `<!-- domain-isolation-marker:v1 -->`. Supports all-plugins sweep (no args) and single-plugin mode (used by `release-plugin.sh`).
- Wired the check into `scripts/release-plugin.sh` as step 0 (pre-flight gate before tag verification + build). A plugin missing its marker can no longer ship a release.
- Patch-bumped each `*-freedom` plugin to record the CLAUDE.md addition:
  - `audio-plugin-freedom` 0.1.1 → 0.1.2
  - `figma-plugin-freedom` 0.1.1 → 0.1.2
  - `webapp-freedom` 0.1.1 → 0.1.2
  - `cli-tool-freedom` 0.1.1 → 0.1.2
  - `hardware-product-freedom` 0.1.2 → 0.1.3
  - `marketing-team-freedom` 0.1.1 → 0.1.2

### Why

Real bleed incident on 2026-04-25: during a Figma-plugin session, `audio-plugin-freedom` context (JUCE auto-layout analogy) leaked into a Figma-table-layout answer that had no audio dimension. All `*-freedom` plugins load simultaneously, so Claude's reasoning can cross domain boundaries silently. CLAUDE.md disclaimers give Claude an explicit per-plugin scope when working in-repo. Falsification test required to confirm the disclaimers actually move behaviour (option B from FEAT-7); if not, escalate to option A (project-domain detection in plugin loader).

### Note on `audio-plugin-freedom-v0.1.1` GitHub release

During FEAT-7 work, a smoke-test of the modified `release-plugin.sh` against `audio-plugin-freedom` v0.1.1 caused the existing GitHub release zip to be `--clobber`-replaced with a freshly-built zip containing the new `CLAUDE.md` file. The git tag `audio-plugin-freedom-v0.1.1` is unchanged and still points at commit `bf8801f`. The v0.1.1 zip on GitHub Releases now diverges from the tag content by one file (`CLAUDE.md`). v0.1.2 supersedes cleanly. Lesson: do not invoke publish commands as smoke tests on existing tags.

### Files

- `audio-plugin-freedom/CLAUDE.md` (new)
- `figma-plugin-freedom/CLAUDE.md` (new)
- `webapp-freedom/CLAUDE.md` (new)
- `cli-tool-freedom/CLAUDE.md` (new)
- `hardware-product-freedom/CLAUDE.md` (new)
- `marketing-team-freedom/CLAUDE.md` (new)
- `scripts/check-domain-isolation.sh` (new)
- `scripts/release-plugin.sh` — pre-flight gate added
- 6 × `<plugin>/CHANGELOG.md` — version entries
- 6 × `<plugin>/.claude-plugin/plugin.json` — version bumps
- `BACKLOG.md` — FEAT-7 closed

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
