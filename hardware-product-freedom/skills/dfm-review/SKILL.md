---
description: Audit a CAD specification against the chosen manufacturing process (injection moulding, CNC, sheet metal, additive). Dispatches dfm-reviewer-agent which produces severity-labelled findings (BLOCKER / MAJOR / MINOR) with proposed fixes. Non-destructive — never auto-edits the spec. Use before releasing CAD spec to a tooling vendor or before committing to first-prototype tooling investment.
---

# DFM Review

## Pre-flight
- `CAD-SPEC-<concept>.md` exists and is the version to review
- `MATERIALS.md` exists (or chosen materials documented in CAD-spec)
- Production volume target known (from RESEARCH-BRIEF) — drives tooling-cost-acceptable thresholds
- Manufacturing process explicit (injection moulding / CNC / sheet metal / additive)

If process is ambiguous, ask user before dispatching — DFM rules differ drastically by process.

## Dispatch

Invoke `dfm-reviewer-agent` with:
- CAD spec path
- Materials path
- Production volume target
- Process target (explicit)

## After dfm-reviewer returns

1. Summarise: count of BLOCKERs / MAJORs / MINORs
2. If BLOCKERs: ship-block. Route fixes to user → designer modifies CAD-spec → re-run dfm-review
3. If MAJORs only: present to user, they decide ship vs. fix
4. If MINORs only: usually fine to ship; optionally pass back to designer for polish

## Process-specific quick-reference (dfm-reviewer's library)

| Process | Key rules |
|---|---|
| Injection moulding | Wall 1.5-3.0 mm uniform; draft ≥ 1°; boss wall ≤ 0.6× main; rib ≤ 0.6× wall; parting line planned |
| CNC machining | Wall ≥ 1.0 mm steel / 1.5 mm Al; corners R ≥ tool R; pocket depth ≤ 4× width; tool-changeover-aware |
| Sheet metal | Bend R ≥ thickness; bend-to-edge ≥ 2× R + thick; hole-to-edge ≥ 2× thick |
| Additive | Layer adhesion = weak axis; orient critical loads accordingly; min wall per process (FDM 1.0, SLS 0.7, MJF 0.5) |

## Anti-patterns
- ❌ DFM review without an explicit production volume (small-batch tolerates what mass-volume can't)
- ❌ Reviewing without specifying the process — "DFM" depends on which DFM
- ❌ Issuing BLOCKERs without proposed fixes
- ❌ Auto-applying fixes — let the designer choose how to address each
