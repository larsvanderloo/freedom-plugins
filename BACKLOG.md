# Suite Backlog

Cross-plugin FEAT items. Single-plugin items live in `<plugin>/BACKLOG.md` (where one exists).

Status legend: `OPEN` / `IN_PROGRESS` / `BLOCKED` / `CLOSED`

---

## FEAT-1 — MCP server for `audio-plugin-freedom`

**Status:** `OPEN`

**Why:** `studio` v0.3.0 ships an MCP server that exposes project-state tools generically. `audio-plugin-freedom` could ship its own MCP server with domain-specific tools (e.g., `analyze_processBlock_cost`, `validate_apvts_layout`, `suggest_oversampling_strategy`, `lookup_juce_api`).

**Success criteria:**
- 4–6 tools, all callable from `audio-plugin-freedom`'s skills
- Bundle pattern matches `studio/mcp/` (single esbuild bundle, no node_modules shipped)
- Live-tested with `claude --plugin-dir`

**Effort:** ~1 day. Pattern is now proven; just instantiate it for audio domain.

---

## FEAT-2 — MCP server for `hardware-product-freedom`

**Status:** `OPEN`

**Why:** Same logic as FEAT-1 but for hardware. Tools like `validate_bom_part_alternates`, `compute_pcb_cost_at_volume`, `check_compliance_for_market`, `suggest_enclosure_material`.

**Effort:** ~1 day, contingent on FEAT-1 establishing the per-plugin MCP pattern.

---

## FEAT-3 — Suite marketplace listing

**Status:** `OPEN`

**Why:** Currently install is `--plugin-dir` or zip-upload. A marketplace listing would let users `/plugin install studio` etc. directly.

**Open questions:**
- Single marketplace entry for the whole suite, or one per plugin?
- Naming under marketplace (`freedom-plugins/studio` vs `studio`)?

**Effort:** unknown — depends on Claude Code marketplace publication flow (TBD).

---

## FEAT-4 — Smoke-test harness for all plugins

**Status:** `OPEN`

**Why:** When a plugin is changed, the only verification today is "load it in claude and try". A scripted harness would loop through each plugin, run a representative scenario, and assert the right skill/agent gets dispatched. (Pattern already exists for `studio` — see its v0.1.1 work.)

**Effort:** ~half day per plugin × 7. Could be a single script with per-plugin scenario YAMLs.

---

## FEAT-5 — Cross-plugin compatibility matrix in README

**Status:** `OPEN`

**Why:** README.md mentions composition but doesn't say which combinations are tested. A matrix (rows = scenarios, columns = plugin combinations) would make this concrete.

**Effort:** ~1 hour to draft once we have FEAT-4's harness data.

---

## Closed items

(none yet — backlog seeded 2026-04-25)
