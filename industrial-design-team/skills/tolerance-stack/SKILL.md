---
description: Run an assembly tolerance-stack analysis — given a CAD spec with mating features (snap-fits, slip-fits, press-fits, bonded joints), compute the worst-case and statistical (RSS) stack-up of dimensional variation. Identifies which features carry the assembly tolerance burden, recommends GD&T tightening or feature redesign where stacks fail. Output: TOLERANCE-STACK.md with a per-mate analysis and tightening recommendations. Use after CAD-spec is drafted, before tooling commitment.
---

# Tolerance Stack

## When to use

Tolerance stacks are needed when:
- Multiple parts mate with cumulative dimensional risk (e.g., 4-part assembly has 4 contributing tolerances)
- Snap-fit engagement must be reliable across worst-case manufacturing variation
- Cosmetic flush-fit between parts (bezel-to-body, button-to-body) needs ≤ 0.1 mm step
- Functional fit (battery-door click, button-travel) has narrow acceptable range

Skip for single-part products or unconstrained mating with generous play.

## Pre-flight

- `CAD-SPEC-<concept>.md` exists with explicit mating features documented
- `MATERIALS.md` exists (modulus + thermal expansion affect dimensional stability)
- Process tolerance class chosen (ISO 2768-mK / fG / ISO 286 / etc.)

## Dispatch (manual analysis — agent guided)

This skill walks the user through the analysis. The pattern:

### Step 1 — Identify the mate of concern

Pick one assembly mate that worries you. Examples:
- Bezel flush to body (visual)
- Snap-fit engagement depth (functional)
- Battery-door rotation-to-detent angle (functional+tactile)

### Step 2 — Diagram the dimension chain

Draw (in ASCII / sketch / words) the chain of dimensions that contribute to the mate gap. Example for "bezel flush to body":

```
[Body face Z=0] → wall thickness → [Body inner face]
                                  → bezel-pocket depth → [Pocket bottom]
                                                       → bezel thickness → [Bezel top face]
                                                                        → adhesive layer thickness → [Body face]

Gap = (bezel-pocket depth) - (bezel thickness) - (adhesive layer thickness)
```

### Step 3 — Worst-case stack

Sum the tolerances at their max and min — the worst-case is the most extreme combination.

Worst-case is **conservative**; never causes assembly failure but designs for unrealistic manufacturing extremes.

### Step 4 — Statistical (RSS) stack

Treats tolerances as independent normal distributions. RSS = √(Σ tolerance²).

Statistical is **realistic** for high-volume manufacturing where extremes are rare.

### Step 5 — Compare to acceptable range

If worst-case stack exceeds acceptable, you have options:

1. **Tighten the worst contributor** (the dim with the largest tolerance) to a tighter class
2. **Use a controlled feature** (machined or post-processed surface for one critical dim)
3. **Add adjustment** (shim, screw-thread tension, foam compression — absorbs variation)
4. **Redesign** (eliminate one contributor, e.g., monolithic housing instead of two-shell)

### Step 6 — Document in `TOLERANCE-STACK.md`

```markdown
# Tolerance stack — <mate name>

## Mate
<bezel-flush-to-body, with sketch>

## Acceptable range
<step ≤ 0.1 mm visible; gap ≤ 0.05 mm dust-blocking>

## Dimension chain
| # | Dim | Nominal | Tolerance | Source / class |
|---|---|---|---|---|
| 1 | bezel-pocket depth | 3.00 mm | ±0.10 mm | ISO 2768-mK on injection moulded |
| 2 | bezel thickness | 3.00 mm | ±0.10 mm | optical PMMA, ISO 2768-fH |
| 3 | adhesive layer | 0.05 mm | ±0.03 mm | dispenser bead control |

## Worst-case stack
0.10 + 0.10 + 0.03 = ±0.23 mm — FAIL (> 0.1 mm acceptable)

## RSS stack
√(0.10² + 0.10² + 0.03²) = ±0.14 mm — also FAIL

## Recommendation
Tighten bezel-pocket depth tolerance to ±0.05 mm via post-mould grinding of the seat surface. New worst-case: 0.05 + 0.10 + 0.03 = ±0.18 mm — still FAIL worst-case. RSS: √(0.05² + 0.10² + 0.03²) = ±0.12 mm — borderline.

Better: change bezel from bonded-into-pocket to flush-mounted-on-surface; the pocket depth dimension drops out of the chain entirely. New chain has 2 contributors instead of 3. RSS becomes ±0.10 mm — PASS.

**Recommend redesign over tolerance tightening.** Tightening is cheap once; redesign is cheap forever.
```

## Anti-patterns
- ❌ Worst-case-only analysis (over-conservative; recommends unnecessarily tight tolerances)
- ❌ Statistical-only analysis (ignores process where worst-case is realistic — small batch CNC tolerances aren't normal-distributed)
- ❌ Tightening tolerances when redesign would eliminate the dim from the chain (always redesign first)
- ❌ Ignoring thermal expansion in materials with different CTEs (e.g., PMMA bezel in PC body across operating-temp range)
- ❌ Tolerance stack on a CAD-spec that hasn't been DFM-reviewed (tolerances depend on process choices)
