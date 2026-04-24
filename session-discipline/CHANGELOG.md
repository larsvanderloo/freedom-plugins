# Changelog

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

First public release of `session-discipline`, a Claude Code plugin distilling project-management discipline from a real multi-week audio-DSP engineering arc.

### What ships

- **7 skills**, all namespaced as `/session-discipline:<name>`:
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
