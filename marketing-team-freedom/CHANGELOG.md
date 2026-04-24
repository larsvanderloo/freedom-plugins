# Changelog

## [0.1.0] — 2026-04-24 (initial release)

First public release of `marketing-team-freedom`, a Claude Code plugin that packages a virtual marketing team as 6 specialised agents + 7 skills.

### Ships

- **6 agents:**
  - `strategist` — positioning, audience, brand voice, messaging hierarchy (Stage 0)
  - `copywriter` — long-form body copy per channel (Stage 3)
  - `hook-writer` — headlines/subject-lines/CTAs, generates 8-15 labelled archetype options (specialised Stage 3)
  - `brand-voice-guardian` — non-destructive voice validator with severity labels (Stage 5)
  - `channel-adapter` — voice-invariant format-variant repurposing across channels (Stage 7)
  - `marketing-orchestrator` — campaign PM, advisory-mode (overlay)

- **7 skills**, all namespaced as `/marketing-team-freedom:<name>`:
  - `brief` — structured creative/campaign brief
  - `write` — dispatch copywriter with brief + channel
  - `hooks` — dispatch hook-writer for option sets
  - `adapt` — dispatch channel-adapter for multi-channel repurpose
  - `voice-check` — dispatch brand-voice-guardian for ship-gate
  - `calendar` — CONTENT-CALENDAR.md maintenance with pillar/cadence analysis
  - `post-mortem` — structured campaign retrospective feeding strategy files

- **README** with install instructions, project structure convention, typical campaign flow, philosophy notes
- **LICENSE** (MIT)
- **Example campaign** at `examples/example-campaign/` demonstrating the full pipeline

### Designed to compose with

- [`session-discipline`](../session-discipline-plugin/) — handoff docs, CHANGELOG continuity, rollback-as-release, advisory orchestration. Recommended companion install.

### Tested with

- Claude Code CLI 2.1.x
- Local `--plugin-dir` install mode
- macOS 14+, bash 5.x

### Known limitations

- No marketplace listing yet — install via `--plugin-dir` or clone.
- No integration with external publishing APIs (Mailchimp, Buffer, etc.) — deliberately a planning / drafting layer, not a CMS. Publishing happens out-of-band.
- Analytics ingestion for post-mortems is manual (you paste numbers from your tools into the post-mortem template). A future version could wire in specific analytics APIs as MCP servers.

### Files

- `.claude-plugin/plugin.json`
- `agents/{strategist,copywriter,hook-writer,brand-voice-guardian,channel-adapter,marketing-orchestrator}.md`
- `skills/{brief,write,hooks,adapt,voice-check,calendar,post-mortem}/SKILL.md`
- `examples/example-campaign/...`
- `README.md`, `LICENSE`, `CHANGELOG.md`
