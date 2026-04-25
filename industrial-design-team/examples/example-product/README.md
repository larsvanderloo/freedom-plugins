# Example product — "Compass" desk-mounted task light

Fictional product to demonstrate `industrial-design-team` plugin output. The user (someone briefing the plugin) is a small hardware studio prototyping a focused desk light — replaceable head, clamp-mounted, USB-C powered.

## What's in this example

| File | What it demonstrates |
|---|---|
| `RESEARCH-BRIEF.md` | `industrial-research` agent output — primary persona, JTBDs, constraints, success criteria |
| `ERGONOMICS.md` | (would also exist; abbreviated for example) — anthropometric envelope for clamp-grip + head-pivot reach |
| `concepts/three-knuckle.md` | One of three concept directions — articulated multi-joint arm |
| `concepts/single-pivot.md` | A second direction — single ball-joint mount |
| `concepts/spring-arm.md` | A third direction — counter-balanced spring arm |
| `CAD-SPEC-three-knuckle.md` | (selected concept's) parametric CAD specification |
| `MATERIALS.md` | Per-part material + finish + cost class + alternatives |
| `DFM-REVIEW.md` | Manufacturability audit findings |

In a real project, files are produced incrementally as the team works through stages. This example shows what the deliverables LOOK LIKE in their final form.

## How to use this example as a starting point

```bash
cp -r examples/example-product /path/to/your/product
cd /path/to/your/product
# Edit each file with your actual product's content
# Or delete files and run agents fresh:
#   /industrial-design-team:concept   # starts industrial-research → concepts
```

## Real project flow

The example shows finished outputs. The actual sequence to produce them was:

```
1. /industrial-design-team:concept
   ├→ industrial-research interviewed user → 4 research files
   └→ concept-agent produced 3 concept directions in concepts/
2. User picked "three-knuckle" direction
3. /industrial-design-team:materials-spec  → MATERIALS.md
   /industrial-design-team:cad-spec        → CAD-SPEC-three-knuckle.md  (parallel)
4. /industrial-design-team:dfm-review      → DFM-REVIEW.md
5. (Iterate on DFM blockers — back to cad-spec)
6. Take CAD-SPEC + MATERIALS + DFM-REVIEW into Fusion 360
7. Build prototype → tolerance-stack any tight mates → tooling vendor
```

The example shows step-7 readiness — files at the moment they'd be handed off for CAD modelling.
