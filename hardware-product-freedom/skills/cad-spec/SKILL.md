---
description: Translate a user-selected concept into a parametric CAD specification — the document a designer takes into Fusion 360 / SolidWorks / Onshape to model from. Dispatches cad-spec-agent with the selected concept + research + ergonomics + materials (if available) as ground truth. Produces CAD-SPEC-<concept>.md with parameters, part hierarchy, per-part specs, GD&T, and CTQ callouts. Use after a concept is selected, before any DFM review.
---

# CAD Spec

## Pre-flight
- Selected concept exists at `concepts/<slug>.md`
- User has explicitly approved the selection
- `RESEARCH-BRIEF.md` + `ERGONOMICS.md` committed
- `MATERIALS.md` is nice-to-have but not required (CAD-spec can include placeholder material assumptions for early DFM review)

## Dispatch

Invoke `cad-spec-agent` with:
- Selected concept file path
- `RESEARCH-BRIEF.md` + `ERGONOMICS.md`
- `MATERIALS.md` if exists, otherwise note "material decisions pending; use placeholder assumptions"
- User's CAD tool preference (Fusion 360 / SolidWorks / Onshape) — affects feature naming + assembly conventions

## After cad-spec-agent returns

1. Read the spec — verify parameters at the top, not hardcoded numbers throughout
2. Check that CTQ callouts are present and meaningful
3. Confirm assembly hierarchy is unambiguous
4. Recommend next:
   - `/industrial-design-team:dfm-review` — manufacturability audit
   - `/industrial-design-team:materials-spec` if materials are still placeholder
   - `/industrial-design-team:tolerance-stack` if any snap-fits, mating features, or tight assembly tolerances

## Anti-patterns
- ❌ Skipping concept-selection step (auto-CAD-spec on a multi-concept directory is invalid)
- ❌ CAD spec with hardcoded numbers — must be parametric
- ❌ Releasing for tooling without DFM review pass
