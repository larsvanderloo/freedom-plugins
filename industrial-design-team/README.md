# industrial-design-team

Claude Code plugin for **hardware product / industrial design** projects. Six specialised agents + five skills covering research → concept → CAD specification → DFM review → materials selection → tolerance-stack analysis.

**Important framing:** Claude doesn't model CAD. This plugin produces **specifications and reviews** — Markdown documents that you take into Fusion 360 / SolidWorks / Onshape, or hand to a designer/engineer to model from. Think of it as the team you wish you had reviewing your work and writing the briefs you used to write yourself.

Designed to layer on [`session-discipline`](../session-discipline) for the session overlay.

## Install

```bash
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/session-discipline \
  --plugin-dir ~/Documents/Claude/claude-plugins/industrial-design-team
```

Or upload `industrial-design-team.zip` via claude.ai.

## Quick start

```
# In a new or existing hardware project directory:
/industrial-design-team:concept     # interview → research → concepts
```

The orchestrator will detect that research files are missing and dispatch `industrial-research` first to interview you. Then `concept-agent` produces 2-4 concept directions for you to pick from.

## Agents

| Agent | Role |
|---|---|
| `industrial-research` | RESEARCH-BRIEF / ERGONOMICS / COMPETITIVE-TEARDOWN / DESIGN-REFERENCES |
| `concept` | 2-4 distinct concept direction documents |
| `cad-spec` | Parametric CAD specification with parameters, parts, GD&T, CTQ |
| `dfm-reviewer` | Severity-labelled manufacturability audit per chosen process |
| `materials` | Material grade + finish + supplier recommendations with tradeoff analysis |
| `industrial-orchestrator` | Project PM — reads state, proposes sequence, dispatches |

## Skills (`/industrial-design-team:<name>`)

| Skill | What it does |
|---|---|
| `concept` | Generate 2-4 distinct concept directions from research |
| `cad-spec` | Translate selected concept into parametric CAD specification |
| `dfm-review` | DFM audit against chosen process (BLOCKER/MAJOR/MINOR severity) |
| `materials-spec` | Material + finish selection with rationale, alternatives, sustainability |
| `tolerance-stack` | Assembly tolerance-stack analysis (worst-case + RSS) for mating features |

## Project structure convention

```
your-product/
├── RESEARCH-BRIEF.md           # industrial-research output
├── ERGONOMICS.md               # industrial-research output
├── COMPETITIVE-TEARDOWN.md     # industrial-research output
├── DESIGN-REFERENCES.md        # industrial-research output
├── concepts/
│   ├── slim-stack.md           # concept-agent: direction 1
│   ├── pebble.md               # concept-agent: direction 2
│   └── weighted-disc.md        # concept-agent: direction 3
├── CAD-SPEC-<selected-concept>.md   # cad-spec-agent
├── MATERIALS.md                # materials-agent
├── DFM-REVIEW.md               # dfm-reviewer-agent
├── TOLERANCE-STACK.md          # tolerance-stack analysis
├── references/
│   ├── competitive/            # photos of competitor products
│   └── inspiration/            # mood-board references
└── post-mortems/               # after-launch retrospectives (optional)
```

## Typical project flow

```
1. /industrial-design-team:concept
   └→ industrial-research interviews you, produces 4 research files
   └→ concept-agent produces 2-4 directions in concepts/
   └→ STOP — you pick one
2. /industrial-design-team:materials-spec
   └→ materials-agent drafts MATERIALS.md (run in parallel with #3)
3. /industrial-design-team:cad-spec
   └→ cad-spec-agent drafts CAD-SPEC-<selected>.md
4. /industrial-design-team:dfm-review
   └→ dfm-reviewer audits CAD-SPEC against process + materials
   └→ Iterate on BLOCKERs (back to cad-spec or materials)
5. /industrial-design-team:tolerance-stack
   └→ if mating features need fit-up validation
6. Take CAD-SPEC + MATERIALS + DFM-REVIEW into Fusion 360 / SolidWorks / Onshape
   └→ The plugin's deliverables guide your modelling work
7. Tooling vendor engagement (out of plugin scope)
8. Prototype rounds, refinement, production
9. Post-launch: post-mortems/<product>-<date>.md
```

## Philosophy

- **Strategy is a committed artefact.** Research files are the contract; every downstream agent reads them. No undocumented assumptions.
- **Concepts come in plurals.** Single-concept output is a smell. 2-4 distinct directions force comparison and explicit choice.
- **Specifications, not geometry.** Claude can't draw — but Claude can specify with rigour. The CAD-spec is the document; the model is the user's (or the designer's) job.
- **DFM is process-specific.** Injection moulding ≠ CNC ≠ sheet metal. The reviewer asks before reviewing.
- **Sustainability honestly.** No "eco-friendly" without a number. Tradeoffs documented.
- **Tolerance stacks before tooling.** Variation kills assembly; analyse before committing capital.

## What this plugin is NOT

- Not a CAD modeller. It writes specifications; humans (or specialised CAD AI) model from them.
- Not a tooling vendor. It briefs the work; you engage tool shops separately.
- Not a stress / FEA / mould-flow simulator. Those are separate domain tools (and separate AI agents if/when they exist).
- Not an electronics designer. Smart products' PCB / firmware / sensors are out of scope — pair with a different plugin.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md).
