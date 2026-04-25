# Changelog

## [0.1.0] — 2026-04-24 (initial release)

Initial release of `industrial-design-team`, a Claude Code plugin for hardware product / industrial design projects.

### Ships

- **6 agents:**
  - `industrial-research` — research, ergonomics, competitive teardown, design references
  - `concept` — 2-4 distinct concept directions per project
  - `cad-spec` — parametric CAD specifications with GD&T + CTQ
  - `dfm-reviewer` — severity-labelled manufacturability audit per process
  - `materials` — material + finish selection with rationale and alternatives
  - `industrial-orchestrator` — project PM, advisory mode, stage-gate enforcement

- **5 skills** (namespaced `/industrial-design-team:<name>`):
  - `concept` — generate 2-4 concept directions from research
  - `cad-spec` — translate concept to parametric CAD specification
  - `dfm-review` — DFM audit per chosen process (injection moulding, CNC, sheet metal, additive)
  - `materials-spec` — material grade + finish + cost class + sustainability profile
  - `tolerance-stack` — assembly tolerance stack-up analysis (worst-case + RSS)

- README, LICENSE (MIT), CHANGELOG, example project (`examples/example-product/`)

### Designed to compose with

- `session-discipline` — handoff docs, CHANGELOG continuity, rollback (e.g., revert from one concept direction to another)

### Scope intentionally limited

The plugin produces **Markdown specifications and reviews** — not CAD geometry. Claude doesn't model in 3D; it briefs and critiques. The user takes the CAD-spec into Fusion 360 / SolidWorks / Onshape (or hands to a designer) for actual geometric modelling.

Out of scope (handled by other tools / future plugins):
- FEA / stress simulation
- Mould-flow simulation
- Electronics design (PCB / firmware / sensors)
- Tooling vendor engagement / quoting
- Production line setup

### Untested in production

Unlike `audio-plugin-freedom` (extracted from a real shipped project), this plugin is **theoretical** — designed from first principles + industrial-design literature. SKILL descriptions are likely to need iteration once exercised against a real hardware project. Treat v0.1.0 as a starting point, not a finished system.

### Future work (post-validation)

- Compliance roadmap agent (FCC / CE / FDA / UL specifics)
- Packaging / unboxing agent
- Surface-finish library with photo references
- Assembly-instructions generator (post-design)
- Repairability scoring per iFixit-style metrics
- Per-region supplier database (materials-agent enhancement)
