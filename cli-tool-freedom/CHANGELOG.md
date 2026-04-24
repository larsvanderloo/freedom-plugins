# Changelog

## [0.1.0] — 2026-04-24 (initial release)

Initial release of `cli-tool-freedom`.

### Ships

- **3 agents:**
  - `cli-design` — CLI-SPEC.md writer; command structure + conventions
  - `cli-impl` — language-specific implementation (Go/Rust/Python/Node)
  - `cli-distribution` — packaging + multi-channel releases

- **5 skills** (namespaced `/cli-tool-freedom:<name>`):
  - `scaffold` — new CLI project skeleton with release tooling pre-wired
  - `command` — add a new subcommand end-to-end
  - `flag` — add a flag (short-form hygiene, env-var override, validation)
  - `completions` — bash / zsh / fish / PowerShell completion scripts
  - `release` — version bump → CHANGELOG → build matrix → multi-channel publish

- Supports 4 languages (Go + cobra, Rust + clap, Python + typer, Node + commander)
- README, LICENSE (MIT), CHANGELOG

### Designed to compose with

- `session-discipline` for session overlay (handoff docs, CHANGELOG discipline, rollback-as-release)

### Not yet included

- Hooks (planned v0.2.0): PostToolUse on `git tag` → verify `--version` output matches
- Example CLI in `examples/` (planned v0.2.0)
- `cli-test-agent` for shell-level + cross-platform QA automation (planned)
- Man page generator (planned)
