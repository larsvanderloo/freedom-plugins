---
description: Generate or update MATERIALS.md — material + finish selection for each part with rationale, cost class, sustainability profile, alternatives considered, compliance flags. Dispatches materials-agent. Reads RESEARCH-BRIEF (constraints) + concept or CAD-spec (intended part roles) + DFM context (process compatibility). Use after a concept is selected, ideally before or in parallel with CAD-spec.
---

# Materials Spec

## Pre-flight
- `RESEARCH-BRIEF.md` committed (especially: budget, sustainability targets, compliance, manufacturing geography)
- Selected concept exists OR CAD-spec exists (both inform per-part role)

## Dispatch

Invoke `materials-agent` with:
- RESEARCH-BRIEF path
- Concept or CAD-spec path
- DFM context (chosen process per part) if available
- User's preference signals if given (e.g., "must be repairable", "prefer recycled content")

## After materials-agent returns

`MATERIALS.md` will list per-part:
- Recommended material (specific grade + supplier reference)
- Why
- Finish
- Cost class
- Alternatives considered + why rejected
- Sustainability profile (recyclability, recycled content, carbon estimate)
- Compliance flags

Verify:
- Specific grades named, not categories
- Alternatives explicitly listed (every choice has tradeoffs)
- Sustainability claims have numbers, not adjectives
- Compliance for target regulations covered

## Anti-patterns
- ❌ Generic categories without grades ("ABS" — must be "ABS, [supplier] [grade] [reason]")
- ❌ No cost class on recommendations
- ❌ Sustainability without specifics
- ❌ Recommending material that fails the chosen DFM process
