# Changelog

## [0.2.0] — 2026-04-25 — MCP server with 5 JUCE-domain tools (FEAT-1)

### What changed

Ships `audio-plugin-freedom-mcp`, an MCP server bundled with the plugin and registered via `.mcp.json`. Provides 5 tools callable directly by Claude:

| Tool | Purpose |
|---|---|
| `scan_realtime_safety` | Walk every `.cpp` source, locate `processBlock`-like methods (processBlock, processBlockBypassed, process, renderNextBlock, processSamples, etc.), flag heap allocs / locks / IO / juce::String literals / container growth / throws / RTTI inside them. Severity-labelled (blocker / major / minor) with rationale per finding. |
| `validate_apvts_layout` | Parse APVTS parameter declarations (`AudioParameterFloat/Int/Bool/Choice`, with or without `juce::ParameterID{}`). Catches: duplicate IDs (silently dropped by APVTS), min ≥ max, default outside range, choice defaultIndex out of bounds, ID-format hygiene, duplicate display-names. |
| `get_audio_project_state` | Detect the pipeline stage (Stage 0 research → Stage 1 shell → Stage 2 DSP → Stage 3 GUI → shipping) by inspecting `architecture.md`, `plan.md`, `dsp-research.md`, `DSP_FREEZE.md`, CMakeLists, `PluginProcessor.cpp/.h`, WebView UI presence, and version-tag count. Returns rationale + recommended next actions. Audio-domain-specific complement to studio's generic `find_active_phase`. |
| `suggest_oversampling_strategy` | Heuristic recommender. Inputs: distortion type (soft-saturation, tube-saturation, asymmetric, hard-clip, wave-fold, bit-crush, ring-mod, fm), highest fundamental, sample rate, CPU budget, preserve_phase. Outputs: factor (1×/2×/4×/8×/16×), filter (halfband-iir, halfband-fir, elliptic-iir, polyphase-fir, lagrange-poly), expected aliasing dB, CPU overhead multiplier, cautions. |
| `check_pluginval_logs` | Parses pluginval output, categorises findings (audio-thread-allocation, audio-thread-lock, audio-thread-fp, param-out-of-range, state-restore, audio-output, format-validation, thread, memory, init-shutdown). Returns triaged punch list with per-category recommendations that often dispatch to other MCP tools. |

### Implementation

- `mcp/` subdir with package.json + tsconfig + src/{index.ts, state/audio-project.ts, parsers/{cpp-source,apvts-layout,pluginval-log}.ts, tools/*.ts}
- esbuild bundle to `mcp/dist/index.js` (640 KB), shipped (committed) so end users don't need npm install
- `.mcp.json` at plugin root registers `audio-plugin-freedom-mcp` via `${CLAUDE_PLUGIN_ROOT}/mcp/dist/index.js`
- Pattern mirrors `studio-mcp` (v0.3.0 shipped 2026-04-25)

### Why

Suite BACKLOG.md FEAT-1 — closing this leverages the studio MCP pattern in the audio domain. Analyses that previously required Claude to read 20+ source files now return as one structured JSON. Most-valuable cases:
- **scan_realtime_safety** — RT-safety bugs are the #1 cause of DAW crashes; pluginval can't always catch them at static-analysis time
- **validate_apvts_layout** — duplicate parameter IDs are silent failures at DAW load time; this catches them before that

### Known limitations

- C++ parsing is heuristic (regex + brace-tracker), not a full Clang AST — false positives possible on creative formatting; see comments per parser
- APVTS parser supports common JUCE 7+ patterns; very custom builders (helper macros, programmatic loops) need manual inspection
- pluginval log parser is line-based; handles standard pluginval output, may miss DAW-specific or future format additions

### Files

- `mcp/` (new — entire subdir, including `dist/index.js`)
- `.mcp.json` (new)
- `.claude-plugin/plugin.json` — version + description
- `CHANGELOG.md` — this entry

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
