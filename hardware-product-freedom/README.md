# hardware-product-freedom

Claude Code plugin for **shipping a hardware product** end-to-end. Combines industrial design + electronics engineering + manufacturing operations into a single coordinated team. 11 specialised agents + 10 skills.

Designed to layer on [`studio`](../studio) for the session overlay.

## When to use

You're shipping a hardware product (consumer electronics, audio gear, IoT device, smart home, etc.) and need:
- Industrial design (form, ergonomics, enclosure)
- Electronics design (schematic, PCB, BOM)
- Manufacturing setup (CM selection, tooling, FAI, pilot runs)
- Compliance (FCC, CE, RoHS, EMC, ESD)

For **non-electronic** hardware (mechanical tools, kitchenware, furniture), this same plugin works — just don't invoke the electronics / manufacturing-ops / compliance skills. They stay dormant if you don't dispatch them. The five core ID skills (`concept`, `cad-spec`, `dfm-review`, `materials-spec`, `tolerance-stack`) cover purely-mechanical product design.

For **software audio plugins only** (no hardware), use [`audio-plugin-freedom`](../audio-plugin-freedom).

## Install

```bash
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/studio \
  --plugin-dir ~/Documents/Claude/claude-plugins/hardware-product-freedom
```

For a software-engine → hardware-product project (porting an audio plugin to a physical pedal), add `audio-plugin-freedom` for the engine work and `marketing-team-freedom` for the launch.

## Agents (11)

### Industrial design (5)
| Agent | Role |
|---|---|
| `industrial-research` | RESEARCH-BRIEF / ERGONOMICS / COMPETITIVE-TEARDOWN / DESIGN-REFERENCES |
| `concept` | 2-4 distinct concept directions per project |
| `cad-spec` | Parametric CAD specification with parameters, parts, GD&T, CTQ |
| `dfm-reviewer` | Severity-labelled manufacturability audit (now covers enclosure AND PCB) |
| `materials` | Material grade + finish + supplier recommendations with tradeoff analysis |

### Electronics (4)
| Agent | Role |
|---|---|
| `electronics-architect` | Block diagram, IC selection with reasoning, power architecture, signal-integrity considerations |
| `schematic-pcb-spec` | Per-block schematic detail + PCB stackup + placement zones + design rules |
| `bom-supply` | BOM creation, supplier selection, lifecycle tracking, supply-chain risk |
| `compliance-emc` | EMC/ESD/safety/RoHS roadmap, lab pre-screen, certification path |

### Manufacturing (1)
| Agent | Role |
|---|---|
| `manufacturing-ops` | CM selection, tooling strategy, pilot run management, FAI, quality gates |

### Orchestration (1)
| Agent | Role |
|---|---|
| `hardware-orchestrator` | Cross-domain Product Owner; finds enclosure↔PCB conflicts, BOM↔schedule risks, compliance↔geography mismatches |

## Skills (10, namespaced `/hardware-product-freedom:<name>`)

### Industrial design (5)
| Skill | What it does |
|---|---|
| `concept` | Generate 2-4 distinct concept directions from research |
| `cad-spec` | Translate concept to parametric CAD specification |
| `dfm-review` | Manufacturability audit per chosen process (enclosure + PCB) |
| `materials-spec` | Material grade + finish + supplier rationale |
| `tolerance-stack` | Assembly tolerance-stack analysis |

### Electronics (3)
| Skill | What it does |
|---|---|
| `electronics-arch` | Block diagram + IC selection + power budget |
| `schematic-pcb-spec` | Per-block schematic + PCB layout specification |
| `bom-audit` | BOM creation + supply-chain risk analysis |

### Manufacturing + compliance (2)
| Skill | What it does |
|---|---|
| `compliance` | Compliance roadmap (FCC/CE/RoHS) + EMC pre-screen |
| `cm-select` | CM selection + tooling + pilot + FAI + ramp |

## Project structure convention

```
your-product/
├── HARDWARE-BRIEF.md           # Phase-1 strategy: volume, price, DSP target
│
├── (industrial design layer)
├── RESEARCH-BRIEF.md
├── ERGONOMICS.md
├── COMPETITIVE-TEARDOWN.md
├── DESIGN-REFERENCES.md
├── concepts/
│   ├── option-a.md
│   ├── option-b.md
│   └── option-c.md
├── CAD-SPEC-<selected>.md
├── MATERIALS.md
├── DFM-REVIEW.md
├── TOLERANCE-STACK.md
│
├── (electronics layer)
├── ELECTRONICS-ARCH.md
├── SCHEMATIC-SPEC.md
├── PCB-LAYOUT-SPEC.md
├── BOM.md
├── BOM.csv
├── COMPLIANCE-ROADMAP.md
│
├── (manufacturing layer)
├── MANUFACTURING-PLAN.md
│
├── references/
│   ├── competitive/
│   └── inspiration/
└── post-mortems/
```

## Typical project flow

```
Phase 1: Strategy          → HARDWARE-BRIEF.md (manual + orchestrator)
Phase 2: Industrial design → /concept → /cad-spec → /materials-spec → /dfm-review → /tolerance-stack
Phase 3: Electronics       → /electronics-arch → /schematic-pcb-spec → /bom-audit → /compliance
Phase 4: Manufacturing     → /cm-select → RFQ → pilot-1 → pilot-2 → production
Phase 5: Compliance lab    → submit to lab; iterate on findings
Phase 6: Production launch → quality gates passed → first sale
```

The `hardware-orchestrator` agent watches for cross-domain conflicts at every phase boundary (enclosure-PCB fit, BOM lead time vs schedule, compliance vs geography).

## Composition with other plugins

For a complete software-engine → pedal → market arc:

| Plugin | Phase |
|---|---|
| `audio-plugin-freedom` | Engine baseline + embedded firmware port |
| `hardware-product-freedom` | Industrial design + electronics + manufacturing |
| `marketing-team-freedom` | Positioning + launch campaign |
| `studio` | Overlay across all phases |

Load all four together. Each plugin's namespace prevents collisions; the orchestrators dispatch within their domain; `studio` provides the cross-cutting overlay.

## Philosophy

- **Cross-domain coordination beats domain-specific perfection.** The hardware-orchestrator's job is to catch enclosure-PCB mismatches before they become tooling rework.
- **Specifications, not files.** CAD spec ≠ CAD file. Schematic spec ≠ schematic file. The plugin produces Markdown specifications; humans (or specialised AI) produce the technical artefacts.
- **Stage gates strictly.** Skipping concept-selection produces wasted CAD work. Skipping pre-screen compliance produces lab failures. Stage gates exist for cost reasons.
- **Pilot-1 ≠ pilot-2 ≠ production.** Each has different quality bars. Conflating them is the most common ramp mistake.
- **Lifecycle awareness.** ICs change status. BOM agent tracks lifecycle. Single-source critical parts always need an alternate qualified.
- **Compliance early.** Mitigations during architecture cost zero; mitigations after layout cost weeks.

## What this plugin is NOT

- Not a CAD modeller (use Fusion 360 / SolidWorks / Onshape)
- Not a schematic editor (use KiCad / Altium / Eagle)
- Not a PCB layout tool
- Not a compliance lab (it briefs the lab; lab tests + certifies)
- Not a CM (it briefs the CM; CM builds)
- Not an FEA / mould-flow simulator

It's the team that coordinates and specifies. The making is done by humans + specialised tools.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md).
