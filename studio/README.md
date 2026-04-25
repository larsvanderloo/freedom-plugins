# studio

**Project-management discipline for long-running Claude Code sessions.**

Packaged from patterns extracted from a real multi-week audio-DSP project (see [`examples/ods-engine-arc.md`](examples/ods-engine-arc.md)). Domain-agnostic — works on any codebase.

Ships seven skills, one agent, two hooks, and an **MCP server with 8 project-state tools** that make long sessions behave less like "ask Claude to do a thing" and more like a disciplined pair-programming loop with a product owner, a handoff-doc habit, a continuous CHANGELOG, rollback discipline, structured A/B judgement calls, and structured cross-session memory.

## Why this exists

Claude Code sessions have a tendency to drift:

- Investigations start confidently and end in "where were we?" confusion
- CHANGELOGs develop gaps when versions ship without matching entries
- Rollbacks happen silently via `git revert`, losing institutional memory
- Subagents get loose with `git commit`, scattering history
- Claude offers subjective "sounds better" opinions the user can't verify

This plugin encodes habits that fix each of those. Each habit is one skill.

## What you get

### Skills (all namespaced as `/studio:<name>`)

| Skill | What it does |
|---|---|
| `orchestrate` | Advisory-mode project orchestrator. Reads state, proposes, waits for approval, dispatches. Never skips the approval step. |
| `handoff-doc` | Write a `HANDOFF-<topic>.md` for cross-session continuity. Forces repro, measurements, ranked hypotheses, cost-ordered recipe, success criteria. |
| `changelog-discipline` | Maintain `CHANGELOG.md` as a first-class artefact — continuous, measurement-driven, investigation-aware. Backfills gaps on request. |
| `backlog` | `BACKLOG.md` with numbered `FEAT-N` items, success criteria, lifecycle markers (OPEN / IN PROGRESS / CLOSED). |
| `investigation-branch` | Disciplined multi-step debugging on a dedicated branch with cost-ordered hypothesis testing and `--no-ff` merge. |
| `rollback-release` | Ship a rollback as a numbered release, not a silent revert. Pin-aware, handoff-aware. |
| `ab-audition` | Structured A/B comparison where the **user** judges — not Claude. Domain-agnostic (audio, UI, ML, text). |

### Agent

- `session-orchestrator` — companion to the `orchestrate` skill. Reads state, proposes plans, dispatches to specialists, enforces discipline. Advisory-mode only.

### Hooks

- `agent-git-boundary` — injects a forbidden-git-ops block into every subagent dispatch. One loose `git commit` from a subagent can scramble real work; this prevents it.
- `version-bump-sync` — runs after `git tag`; verifies `CMakeLists.txt` / `package.json` / `Cargo.toml` / `pyproject.toml` version strings match the tag. Warns on drift.

### MCP server (`studio-mcp`, since v0.3.0)

Auto-launched when the plugin loads (via `.mcp.json`). Requires **Node ≥20** on PATH. Exposes 8 tools:

| Tool | Purpose |
|---|---|
| `recommend_plugins` | Inspect project filesystem → recommend which `*-freedom` plugins to load. |
| `propose_next_action` | Read all state and propose the next action. Powers `/studio:orchestrate`. |
| `cross_plugin_search` | Free-text search across HANDOFFs, CHANGELOG, BACKLOG, specs, concepts, post-mortems. |
| `find_active_phase` | Per-domain phase detection with percent-complete. |
| `track_decision` | Persist a decision to `.claude-state/decisions.jsonl` (cross-session memory). |
| `list_decisions` | Retrieve persisted decisions, optionally filtered by type. |
| `list_committed_artefacts` | Inventory of state files grouped by domain. |
| `get_open_blockers` | Severity-labelled blockers — handoffs, backlog, uncommitted WIP, test failures. |

Tools are namespaced as `studio:<tool>` and callable from any skill or agent in the session. Cross-session decisions live at `.claude-state/decisions.jsonl` (auto-`.gitignore`'d).

## Install

### Local (for development / single-user)

```bash
# Clone or copy this repo anywhere on disk:
git clone https://github.com/larsvanderloo/studio-plugin ~/plugins/studio

# Run Claude Code with the plugin loaded:
claude --plugin-dir ~/plugins/studio
```

After a change to the plugin, run `/reload-plugins` inside Claude Code — no need to restart.

### Via marketplace (once published)

```
/plugin install studio
```

## Quick start

Drop into any codebase and run:

```
/studio:orchestrate
```

The orchestrator will read your git state, CHANGELOG, backlog, and any handoff docs, then propose what to work on next. Approve its plan or redirect.

Partway through a debug session, type:

```
/studio:handoff-doc
```

...and you'll have a ready-to-read doc for picking the investigation back up tomorrow.

Before shipping a fix:

```
/studio:changelog-discipline
```

...and the CHANGELOG entry will have the measurement table, investigation timeline (if applicable), and file list that makes the release auditable.

## Patterns in detail

### Pattern 1 — Advisory-mode orchestration

Instead of executing immediately, the orchestrator proposes:

```
Current status: v0.20.8 shipped; plugin tagged; clean channel noise-free.
Recommended:
  1. Close FEAT-7 in BACKLOG.md (~2 min) → direct edit
  2. Regenerate REVERT-TEST anchors at v0.20.8 baseline (~10 min) → dispatch to process-wav
  3. File next session handoff if stopping (~5 min) → /studio:handoff-doc

Approve 1+2, or redirect?
```

You stay in the driver's seat. The orchestrator is a map, not a wheel.

### Pattern 2 — Handoff docs for investigations

Every non-trivial investigation gets a `HANDOFF-<topic>.md` with a fixed schema: TL;DR, git state to verify, exact repro command, measurement table, ranked hypotheses (cost-ordered), step-by-step recipe, success criteria, out-of-scope notes.

This lets you close Claude Code, come back tomorrow, read one file, and be fully re-oriented in 60 seconds.

### Pattern 3 — Continuous CHANGELOG

- Every git tag has a CHANGELOG entry.
- Every entry has a measurement table if behaviour changed.
- Every non-trivial fix has an investigation timeline showing which hypotheses were rejected.
- Gaps get backfilled on request from git tag messages.

### Pattern 4 — Investigation branches with cost-ordered hypotheses

Multi-step debug? Branch off main. Install the repro as the first commit. Test hypotheses in **cost order** (5-minute test before 5-hour test), not confidence order. Commit each rejection with evidence. Merge back with `--no-ff` to preserve the investigation arc.

### Pattern 5 — Rollback as a release

If you ship a broken v1.2.3 and the root cause isn't quickly fixable, you don't `git revert` — you ship v1.2.4 with its own CHANGELOG entry labelled `ROLLBACK:`. The failing tag stays discoverable (needed for A/B). A `HANDOFF-*.md` tracks the proper fix. The rolled-back state is a first-class release.

### Pattern 6 — A/B audition framework

When a change has a qualitative dimension, **you don't get to decide it's better**. Render A and B with identical inputs, measure everything measurable, present neutrally, wait for the user's verdict. Falsify earlier subjective claims with A/Bs.

### Pattern 7 — Functional defect framing

"This sounds harsh" is not a bug report. "THD at Volume=0.5 is 1.1% vs schematic spec 0.4%" is. The orchestrator reframes subjective reports as functional ones before dispatching work on them.

## Use on domains other than audio DSP

Every skill is intentionally domain-agnostic. Examples:

- **Web app:** Use `investigation-branch` + `handoff-doc` for a multi-day OAuth-redirect debug. Use `ab-audition` for two CSS candidates. Use `changelog-discipline` for the monorepo's top-level CHANGELOG.
- **Data pipeline:** Use `backlog` to track model-improvement FEATs. Use `rollback-release` when a pipeline change breaks a downstream dashboard and you need to re-pin the upstream version.
- **ML training:** Use `ab-audition` on two model checkpoints with the same eval set. Use `handoff-doc` to park a training run that's still 6 hours from convergence.

Nothing about this plugin requires C++ or JUCE or audio tooling.

## Philosophy

- **User is in the loop.** Claude proposes, user approves. No autopilot unless explicitly requested.
- **Concrete over abstract.** Cite SHAs, line numbers, measurements — never adjectives.
- **Cost order over confidence order.** The 5-minute hypothesis always comes before the 5-hour one, even when your gut says otherwise.
- **Rollback is a release.** Reverting is a public, audited decision, not a silent history rewrite.
- **A/B is judged by the user.** Claude doesn't get to say "it sounds better" — the user's ears do.
- **Handoffs are atomic with WIP.** If you're stopping mid-investigation, the handoff ships in the same commit as the WIP.

## Development

```bash
# Test locally
claude --plugin-dir $(pwd)

# Inside Claude Code:
/help                        # should list studio:<skill> entries
/studio:orchestrate  # dry-run on current project

# Hot reload after edits:
/reload-plugins
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Patterns extracted from the `ods-engine` Dumble ODS #124 modelling project — a real multi-week audio-DSP engineering arc with all the mess a serious project accumulates. The `examples/ods-engine-arc.md` case study walks through one complete session (the v0.20.5 clean-preamp noise investigation → v0.20.8 resolution) as a demonstration of the plugin's patterns in practice.
