---
description: Define the electronics architecture for a hardware product — block diagram, MCU/DSP/SoC selection with reasoning, peripheral architecture, power architecture, signal-integrity considerations, power budget. Dispatches electronics-architect agent. Reads RESEARCH-BRIEF, the selected concept, and any user inputs on stack preferences. Produces ELECTRONICS-ARCH.md as the architectural contract every downstream electronics agent reads. Use after concept is selected, before any schematic detail.
---

# Electronics architecture

## Pre-flight
- Selected concept exists at `concepts/<slug>.md`
- `RESEARCH-BRIEF.md` committed (volume target, price target, geography drive IC selection)
- Optional: user input on chosen DSP family, ADC/DAC tier, connectivity needs

## Dispatch
Invoke `electronics-architect` with:
- Selected concept + research brief
- Any constraint hints ("must use Daisy Seed", "BOM target $8")
- Geography of sale (compliance affects architecture)

## After agent returns
Verify:
- Block diagram is complete (audio path, control path, power path, connectivity)
- Every IC has a 3-bullet rationale (technical fit, lifecycle, supply risk)
- Two alternates listed for critical ICs
- Power budget table totals to ≤ standard 9V/500 mA pedal supply (or your target)
- Signal-integrity rules at block level (analog/digital ground separation, decoupling intent)

## Recommend next
- `/hardware-product-freedom:schematic-pcb-spec` — circuit-level detail
- `/hardware-product-freedom:bom-audit` — supply-chain feasibility on chosen ICs
- `/hardware-product-freedom:compliance` — early compliance pre-screen

## Anti-patterns
- ❌ Architecting around a specific IC because of familiarity, no alternates
- ❌ Skipping power budget
- ❌ Not flagging supply risk on critical components
