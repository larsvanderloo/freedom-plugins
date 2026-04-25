---
description: EMC + ESD + safety + regulatory compliance roadmap. Dispatches compliance-emc agent. Reads ELECTRONICS-ARCH + SCHEMATIC-SPEC + MATERIALS + target sales geographies. Produces COMPLIANCE-ROADMAP.md identifying required certifications per geography, lab-testing budget + lead times, pre-screen risks (ESD, conducted/radiated emissions), marking + documentation requirements, and a schedule. Use early — pre-screen mitigations are cheap to design in, expensive to retrofit.
---

# Compliance

## Pre-flight
- `ELECTRONICS-ARCH.md` (covers what compliance regimes apply)
- `MATERIALS.md` (RoHS scope; metal vs plastic enclosure changes ESD picture)
- Target sales geographies confirmed (US? EU? CN? AU?)

## Dispatch
Invoke `compliance-emc` agent with:
- Architecture + schematic spec + materials
- Target sales geographies (mandatory)
- Notes on AC vs DC powered, USB, wireless presence
- Battery if rechargeable (triggers UN 38.3)

## After agent returns
Verify:
- Required certifications enumerated per geography
- Pre-screen risk table (ESD, emissions, immunity, safety)
- Mitigations specified at the schematic / layout level
- Marking requirements listed
- Documentation deliverables listed (block diagram, schematic, layout, BOM, mech drawing)
- Schedule realistic (4-12 weeks lab + 4 weeks prep)
- Quote 2-3 lab candidates with regions

## Recommend next
- Apply pre-screen mitigations to schematic-pcb-spec if any flagged
- `/hardware-product-freedom:cm-select` — confirm CM can handle compliance docs
- Engage compliance lab early (10+ weeks before shipping)

## Anti-patterns
- ❌ Pursuing compliance after design freeze (mitigations cost less BEFORE layout)
- ❌ Self-declaring CE for products that need EN 55032 testing
- ❌ Single-lab strategy
- ❌ Forgetting RoHS supplier documentation (caught at customs, holds shipments)
