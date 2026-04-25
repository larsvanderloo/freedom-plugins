# Changelog

## [0.1.2] — 2026-04-25 (domain-isolation contract)

### What changed

- Added `CLAUDE.md` declaring this plugin's domain (JUCE audio plugins) and a contract not to import audio/DSP/JUCE analogies into non-audio work when this repo is open.
- Suite-level: `scripts/check-domain-isolation.sh` enforces the marker presence; called from `release-plugin.sh` as a pre-flight gate.

### Why

Suite BACKLOG.md FEAT-7 — domain bleed between simultaneously-loaded `*-freedom` plugins (e.g. JUCE-style analogies appearing in Figma-plugin work). Each plugin now ships an explicit scope boundary.

### Note on v0.1.1 GitHub release zip

The `audio-plugin-freedom-v0.1.1` zip on GitHub Releases was inadvertently rebuilt + re-uploaded during FEAT-7 work and now contains `CLAUDE.md` (which was not part of the original v0.1.1 commit). The git tag `audio-plugin-freedom-v0.1.1` is unchanged. v0.1.2 supersedes v0.1.1 cleanly.

### Files

- `CLAUDE.md` (new)
- `.claude-plugin/plugin.json` — version bump

## [0.1.0] — 2026-04-24 (initial release — extracted from ods-engine)

First public release of `audio-plugin-freedom`, packaging the agent team behind the `ods-engine` Dumble ODS #124 modelling project.

### Ships

- **14 agents** (copied verbatim from `ods-engine/.claude/agents/`):
  - Stage 0: `dsp-research-agent`, `research-planning-agent`
  - Stage 1: `foundation-shell-agent`
  - Stage 2: `dsp-agent`
  - Stage 3: `ui-design-agent`, `ui-finalization-agent`, `gui-agent`
  - Validation: `validation-agent`, `audio-qa-agent`
  - Release: `sound-design-agent`, `cicd-agent`, `plugin-engineer-agent`
  - Always: `troubleshoot-agent`, `product-orchestrator-agent`

- **13 skills** (namespaced `/audio-plugin-freedom:<name>`):
  - Lifecycle: `plugin-ideation`, `plugin-planning`, `plugin-workflow`, `plugin-testing`, `plugin-packaging`, `plugin-lifecycle`, `plugin-improve`
  - DSP-specific: `audio-qa`, `dsp-research`, `sound-design`
  - UI: `ui-mockup`
  - Release: `cicd`
  - Operational: `troubleshooting-docs`

- README, LICENSE (MIT), CHANGELOG

### Provenance

All agents and skills were used in production on the ods-engine project across the v0.5.0 → v0.20.10 release arc. They survived:
- Multi-day investigation arcs (v0.20.5 noise regression → v0.20.8 root-cause fix)
- Production rollbacks (v0.20.6) and re-shipping (v0.20.7, v0.20.8)
- Multiple audio QA passes against null-test thresholds
- Plugin packaging + Logic AU validation
- Multi-stage architecture refactors

This is not a fresh design — it's an extraction of patterns that worked.

### Designed to compose with

- `studio` for session overlay (handoff docs, CHANGELOG, rollback-as-release, orchestration)

### Known overlap with studio

`product-orchestrator-agent` (audio-specific) and `session-orchestrator` (domain-agnostic) both exist. Use product-orchestrator-agent when the orchestration is audio-DSP-specific (knows about JUCE, plate voltages, null thresholds); use session-orchestrator for cross-cutting session work (handoffs, changelogs, branch hygiene). They complement each other.

### Future work

- Once a second audio plugin project uses these agents, iterate descriptions based on real invocation patterns (the same way studio went 0.1.0 → 0.1.1)
- Consider a `juce-update` skill for keeping JUCE version current
- Consider integrating `mcp__faust__*` (Faust workspace) and `mcp__context7__search_juce_docs` more tightly
