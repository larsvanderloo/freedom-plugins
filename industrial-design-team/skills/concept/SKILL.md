---
description: Generate 2-4 distinct concept directions for a hardware product after research is committed. Dispatches concept-agent, which reads RESEARCH-BRIEF / ERGONOMICS / DESIGN-REFERENCES / COMPETITIVE-TEARDOWN and produces structurally-distinct (not cosmetic-variant) concept files in concepts/. User picks one before proceeding to CAD-spec. Use when research is done and you're ready to explore form.
---

# Concept

## Pre-flight
Verify these are committed:
- `RESEARCH-BRIEF.md`
- `ERGONOMICS.md`
- `DESIGN-REFERENCES.md`
- `COMPETITIVE-TEARDOWN.md`

If any are missing, redirect to `industrial-research-agent` first.

## Dispatch

Invoke `concept-agent` with:
- All four research files as ground truth
- Optional: user hint on direction ("explore quieter, sturdier vs lighter, gestural")
- Constraint: produce 2-4 STRUCTURALLY-distinct directions, not colour variants

Outputs files at `concepts/<slug>.md` — one per direction.

## After concept-agent returns

1. Verify the concepts pass the "different concepts test":
   - Each concept has a 1-sentence summary that's structurally distinct
   - "Compared to concept B, this concept ___" answer must be structural, not cosmetic
2. Present all 2-4 directions to user with the comparison
3. **Stop. User picks.** Don't auto-proceed.

## Anti-patterns
- ❌ Single "best" concept output — generate widely, narrow with user
- ❌ Cosmetic-only variants ("same form, different colour") — restart with structural prompt
- ❌ Auto-proceeding to CAD-spec without user concept selection
