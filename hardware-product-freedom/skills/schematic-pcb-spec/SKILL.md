---
description: Detailed schematic + PCB layout specification — net classes, per-block component values + tolerances + packages, decoupling strategy, ESD strategy, power-up sequence, PCB stackup, placement zones, ground strategy, layout rules, design rules, test points. Dispatches schematic-pcb-spec agent. Reads ELECTRONICS-ARCH (architecture), CAD-SPEC (enclosure constraints), MATERIALS (PCB substrate). Produces SCHEMATIC-SPEC.md + PCB-LAYOUT-SPEC.md. Does NOT produce schematic files / Gerbers — that's the layout engineer's work in KiCad / Altium / Eagle.
---

# Schematic + PCB Spec

## Pre-flight
- `ELECTRONICS-ARCH.md` committed (block diagram + IC choices locked)
- `CAD-SPEC-<concept>.md` committed (enclosure interior volume, mount points)
- `MATERIALS.md` committed (or PCB substrate explicit elsewhere)

## Dispatch
Invoke `schematic-pcb-spec` agent with:
- Architecture file
- Enclosure CAD spec
- Materials (especially PCB substrate grade)
- Production volume (drives layer count + finish choices)

## After agent returns
Verify:
- Per-block detail (one section per block from architecture)
- Net classes table complete and consistent
- Decoupling strategy explicit (every IC, every rail)
- ESD strategy at every external connector
- PCB stackup matches volume (4-layer std, more only if justified)
- Placement zones separate audio analog from digital
- Ground strategy explicit (single-point analog↔digital tie)
- Test points sufficient for diagnosis

## Recommend next
- `/hardware-product-freedom:dfm-review` — manufacturability audit (now covering enclosure + PCB)
- `/hardware-product-freedom:bom-audit` — full BOM creation
- `/hardware-product-freedom:tolerance-stack` — PCB-to-enclosure fit-up

## Anti-patterns
- ❌ Producing schematic before architecture is locked
- ❌ Vague decoupling specs
- ❌ Skipping ESD strategy
- ❌ Insufficient layer count for the design complexity
