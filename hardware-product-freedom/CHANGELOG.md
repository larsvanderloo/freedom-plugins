# Changelog

## [0.1.0] — 2026-04-25 (initial release)

Initial release of `hardware-product-freedom`, a unified Claude Code plugin for shipping hardware products end-to-end. Combines industrial design + electronics engineering + manufacturing operations into a single coordinated team.

### Ships

- **11 agents:**
  - Industrial design: `industrial-research`, `concept`, `cad-spec`, `dfm-reviewer`, `materials`
  - Electronics: `electronics-architect`, `schematic-pcb-spec`, `bom-supply`, `compliance-emc`
  - Manufacturing: `manufacturing-ops`
  - Orchestration: `hardware-orchestrator` (cross-domain Product Owner)

- **10 skills** (namespaced `/hardware-product-freedom:<name>`):
  - Industrial design: `concept`, `cad-spec`, `dfm-review`, `materials-spec`, `tolerance-stack`
  - Electronics: `electronics-arch`, `schematic-pcb-spec`, `bom-audit`
  - Compliance + manufacturing: `compliance`, `cm-select`

- README, LICENSE (MIT), CHANGELOG

### Designed to compose with

- `session-discipline` — handoff docs, CHANGELOG continuity, rollback (e.g., revert from one electronics architecture to another)
- `audio-plugin-freedom` — for the engine work that precedes hardware port
- `marketing-team-freedom` — for the launch campaign
- `industrial-design-team` — alternative for non-electronic hardware (mechanical tools, kitchenware, furniture)

### Relationship to `industrial-design-team`

`hardware-product-freedom` is the **comprehensive** version covering electronics + manufacturing. `industrial-design-team` is the **lighter** alternative for pure ID projects without electronics. Both will coexist in the monorepo; pick based on project scope:

- Hardware product with electronics → `hardware-product-freedom`
- Hardware product without electronics (mechanical, furniture, etc.) → `industrial-design-team`

The 5 industrial-design agents and skills are duplicated across both plugins (with identical content) so each works standalone.

### Untested in production

Like `industrial-design-team`, this plugin is **theoretical** — designed from first principles + industrial-design + electronics + manufacturing literature. SKILL descriptions and agent boundaries will likely need iteration once exercised against a real hardware project. Treat v0.1.0 as a starting point.

### Future work

- `firmware-bridge` agent — interface between PCB and firmware (pinout, peripheral usage)
- Wireless-specific compliance (FCC Part 15 Subpart C, EU RED) when applicable
- Battery-specific compliance (UN 38.3, IEC 62133)
- Detailed packaging design agent (unboxing, protection)
- Sustainability scoring per repairability/disassembly criteria
- Per-region supplier database expansion
