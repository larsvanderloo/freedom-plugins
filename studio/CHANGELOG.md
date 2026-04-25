# Changelog

## [0.3.0] — 2026-04-25 (MCP server: project-state intelligence + cross-session memory)

### What ships

A new `studio-mcp` MCP server bundled inside the plugin (`mcp/dist/index.js`, single self-contained ~650 KB ESM bundle, no `node_modules` shipped). Auto-launched via `.mcp.json` when the plugin is loaded. Exposes **8 tools** under the `studio` namespace:

| Tool | Purpose |
|---|---|
| `recommend_plugins` | Filesystem inspection → ordered list of plugins to load (audio/figma/webapp/cli/hardware/marketing), with rationale + the exact `claude --plugin-dir` install command. |
| `propose_next_action` | Reads project state across all artefacts (CHANGELOG, BACKLOG, HANDOFF docs, git, domain-specific spec files) and proposes the next concrete action. Returns: synthesised state, cross-domain conflicts, numbered actions with effort estimates + dispatch targets, risk flags. The orchestration heart. |
| `cross_plugin_search` | Free-text search across HANDOFF docs / CHANGELOG / BACKLOG / RESEARCH-BRIEF / spec docs / concepts/ / campaigns/ / post-mortems/. Returns hits with path + line + 3-line context. |
| `find_active_phase` | Per-domain phase detection. For each detected domain reports current phase, next expected phase, percent-complete based on which artefacts are committed. |
| `track_decision` | Persist a project-level decision (stack-choice, IC-alternate, concept-pick, API-contract-lock) to `.claude-state/decisions.jsonl` (append-only). |
| `list_decisions` | Retrieve persisted decisions, optionally filtered by type. Use at session start to remember prior decisions. |
| `list_committed_artefacts` | Inventory of state files grouped by domain + category. Plus 5 most-recently modified. Orient a fresh session quickly. |
| `get_open_blockers` | Severity-labelled blockers — handoffs marked in-progress/blocked, BACKLOG IN_PROGRESS or BLOCKED, large uncommitted WIP, detected test failures. |

### Why

The `orchestrate` skill has been the most-used and most-praised feature — it picks up state automatically across sessions and proposes the next action without re-explaining context. v0.3.0 promotes that intelligence from a per-skill heuristic into a structured tool surface that any skill or agent can call. Cross-session decision memory (`.claude-state/decisions.jsonl`) finally gives the plugin a place to remember user decisions across Claude Code sessions, instead of relying on artefact archaeology every time.

### Implementation

- **Stack:** TypeScript ES2022 / Node ≥20 / `@modelcontextprotocol/sdk` v1.29 / `zod` for argument validation
- **Bundle:** esbuild → single `dist/index.js`, no `node_modules` shipped in the plugin zip
- **State model:** `mcp/src/state/project-model.ts` builds a unified `ProjectModel` (artefacts, git, handoffs, backlog, changelog, detected domains) once per tool call
- **Domain detection:** filesystem signatures — JUCE in `CMakeLists.txt` / `.jucer`, `manifest.json` + `code.ts` for figma, React/Vue/Svelte/Next deps for webapp, `Cargo.toml` / `pyproject.toml` / `go.mod` for cli, `HARDWARE-BRIEF` / `ELECTRONICS-ARCH` / `BOM` for hardware, `POSITIONING` / `AUDIENCE` / `BRAND-VOICE` for marketing
- **Persistence:** append-only JSONL at `.claude-state/decisions.jsonl`; auto-creates a `.gitignore` in the state dir

### Migration from v0.2.0

No breaking changes. All 7 skills + agent + 2 hooks behave identically. The MCP server is additive — load the plugin and the new tools are available alongside existing skills.

End users need **Node ≥20** on PATH for the MCP server to launch. If Node is missing, the rest of the plugin (skills, agents, hooks) still works; only the MCP tools are unavailable.

### Files added

- `.mcp.json` — wires `studio-mcp` to `${CLAUDE_PLUGIN_ROOT}/mcp/dist/index.js`
- `mcp/package.json`, `mcp/tsconfig.json`
- `mcp/src/index.ts` — server entry, 8 tool dispatchers
- `mcp/src/state/project-model.ts` — unified state reader
- `mcp/src/state/memory.ts` — append-only decision log
- `mcp/src/tools/{recommend-plugins,propose-next-action,cross-plugin-search,find-active-phase,track-decision,list-artefacts,get-blockers}.ts`
- `mcp/dist/index.js` — bundled output (committed to plugin so end users don't need to `npm install`)

### Verified

- `tools/list` JSON-RPC returns all 8 tools correctly schema'd
- `propose_next_action` against real `ods-engine` repo correctly detects `audio` domain (via `CMakeLists.txt` JUCE references), enumerates 14 committed state artefacts, 12 open handoffs, 10 commits ahead of origin, and emits sensible next-action recommendations + risks

## [0.2.0] — 2026-04-25 (renamed: session-discipline → studio)

### What changed

- **Plugin name:** `session-discipline` → `studio`
- **Skill namespace:** `/session-discipline:*` → `/studio:*` (all 7 skills: orchestrate, handoff-doc, changelog-discipline, backlog, investigation-branch, rollback-release, ab-audition)
- **Agent name:** `session-orchestrator` → `studio-orchestrator`
- **No content changes** — every skill body, every hook, every behaviour identical to v0.1.1. Pure rename + namespace bump.

### Why

"session-discipline" overloaded Claude Code's native session concept. "studio" maps cleaner onto what the plugin actually does — the team / studio overlay running across whatever other plugins are loaded.

### Migration from v0.1.1

1. Replace `session-discipline` with `studio` in your `--plugin-dir` flags (or upload `studio.zip` via claude.ai after uninstalling `session-discipline`)
2. `/session-discipline:orchestrate` → `/studio:orchestrate` (same for all 7 skills)
3. Agent renamed `session-orchestrator` → `studio-orchestrator`
4. Hooks behave identically

The `session-discipline-v0.1.1` git tag is preserved.

### Cross-references in domain plugins

All 6 domain plugins (audio, marketing, figma, webapp, cli, hardware) updated to reference `/studio:*` instead of `/session-discipline:*`. Each gets a patch-bump for the cross-reference changes.

## [0.1.1] — 2026-04-24 (SKILL description refinement based on scenario testing)

### What this fixes

Ran 40 scenario prompts (20 common + 20 edge-case) through Claude with the plugin loaded from a throwaway sandbox, observing which skill Claude predicted invoking for each. Three description-level issues surfaced:

1. **`ab-audition` over-invoked on architectural decisions** ("Should I use Postgres or MongoDB?" triggered it). A/B is for perceptual / aesthetic judgements, not technology-stack choices. Fix: added explicit anti-trigger for architecture / technology-choice / library-choice decisions to the description.

2. **`rollback-release` NOT invoked on "we're down" / "deploy failed"** — Claude defaulted to `investigation-branch` for production-down incidents. That's operationally wrong: restore prod first, investigate second. Fix: rewrote description as "HIGHEST-PRIORITY INCIDENT RESPONSE" with aggressive trigger language covering urgency signals without requiring the literal word "rollback".

3. **`investigation-branch` over-invoked on vague one-liners** ("investigate the memory leak"). Fix: description now requires ≥2 explicit scale signals (multiple hypotheses, prior failed attempts, effort estimate, hard-to-repro character, HANDOFF resume, or explicit "set up investigation" language) before invoking.

### Measured impact

| Scenario | v0.1.0 behavior | v0.1.1 behavior |
|---|---|---|
| "Should I use Postgres or MongoDB?" | `ab-audition` (wrong) | NONE (correctly deferred) |
| "Algorithm is faster but not sure, what do you think?" | `ab-audition` (wrong) | NONE (correctly deferred) |
| "Deploy failed 30min ago, we're down" | `investigation-branch` (missed rollback!) | **`rollback-release`** ✓ |
| "Is this feature done?" | `orchestrate` | NONE (correctly delegates to `verification-before-completion`) |

Regression check: all 20 original-suite scenarios still resolve identically (no regressions introduced by the tightening).

### Files changed

- `skills/ab-audition/SKILL.md` — description: added "NOT for architectural / technology-stack / library-choice decisions" anti-trigger
- `skills/rollback-release/SKILL.md` — description: promoted to "HIGHEST-PRIORITY INCIDENT RESPONSE"; expanded urgency triggers; made explicit that rollback-release dispatches BEFORE investigation-branch when prod is affected
- `skills/investigation-branch/SKILL.md` — description: now requires ≥2 scale signals before invoking; added explicit deferral to plain debugging for vague one-liners; cross-references rollback-release priority for production-down

### Known borderline (not fixed)

- `ab-audition` still invokes on "button padding feels wrong" (borderline — user reported defect without asking for A/B, but Claude reasonably interprets "feels wrong" as perceptual). Minor, defensible either way.
- `investigation-branch` still invokes on "investigate this memory leak" despite tightening (Claude reads "memory leak" as inherently multi-step). Diminishing returns; leaving.

### Method

Test procedure (portable to any future SKILL authoring):
1. Write 15-20 scenario user-messages per skill + trap cases
2. Run via `echo "" | claude --plugin-dir <path> -p "<scenarios>"` from a throwaway dir
3. Compare Claude's predicted invocations to expected
4. Identify over/under-invocation patterns → SKILL description is where the fix goes (not the SKILL body)
5. Iterate until convergence

Preserved scenarios at `examples/scenario-tests/` for future re-runs.

## [0.1.0] — 2026-04-24 (initial release — patterns extracted from ods-engine)

First public release of `studio`, a Claude Code plugin distilling project-management discipline from a real multi-week audio-DSP engineering arc.

### What ships

- **7 skills**, all namespaced as `/studio:<name>`:
  - `orchestrate` — advisory-mode project orchestrator
  - `handoff-doc` — cross-session continuity with structured template
  - `changelog-discipline` — continuous measurement-driven CHANGELOG
  - `backlog` — numbered `FEAT-N` items with success criteria
  - `investigation-branch` — cost-ordered hypothesis debugging
  - `rollback-release` — numbered rollback releases with preserved failing-state
  - `ab-audition` — user-judged A/B framework, domain-agnostic
- **1 agent:** `session-orchestrator` — advisory-mode PM agent
- **2 hooks:**
  - `SubagentStart` → `agent-git-boundary.sh` injects forbidden-git-ops guardrail into every subagent dispatch
  - `PostToolUse` on `git tag` → `version-bump-sync.sh` verifies `CMakeLists.txt` / `package.json` / `Cargo.toml` / `pyproject.toml` match the new tag
- **Docs:** README, ods-engine case study (`examples/ods-engine-arc.md`), MIT LICENSE

### Provenance

Every pattern in this plugin came out of the `ods-engine` project's v0.19.x–v0.20.x release arc. See `examples/ods-engine-arc.md` for a walkthrough of how all 7 skills and both hooks were used together in a real 3-session debugging arc (v0.20.5 clean-preamp noise regression → v0.20.8 root-cause fix).

### Tested with

- Claude Code CLI (current version as of 2026-04-24)
- macOS 14+ / bash 5.x / jq 1.7+
- Local `--plugin-dir` install mode

### Known limitations

- Hook scripts assume `jq` is installed. If missing, hooks degrade to silent no-ops.
- `version-bump-sync` recognises four manifest formats (CMake, npm, Cargo, PEP 621). Other ecosystems (Go modules, Gemspec, composer.json, etc.) are not currently checked.
- No marketplace listing yet — install via `--plugin-dir` or clone-and-symlink.

### Files

- `.claude-plugin/plugin.json`
- `skills/{orchestrate,handoff-doc,changelog-discipline,backlog,investigation-branch,rollback-release,ab-audition}/SKILL.md`
- `skills/handoff-doc/references/template.md`
- `agents/session-orchestrator.md`
- `hooks/hooks.json`, `hooks/scripts/{agent-git-boundary,version-bump-sync}.sh`
- `README.md`, `LICENSE`, `CHANGELOG.md`
- `examples/ods-engine-arc.md`
