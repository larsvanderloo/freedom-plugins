---
description: Create or audit the BOM — supplier part numbers, alternates, lifecycle status, lead times, supply-chain risk flags, cost-class at target volume, RoHS compliance. Dispatches bom-supply agent. Reads ELECTRONICS-ARCH + SCHEMATIC-SPEC + MATERIALS. Produces BOM.md (review-friendly) + BOM.csv (CM-submission). Audit catches: single-sourced critical parts, NRND/EOL ICs, long-lead parts vs schedule, BOM cost overrun vs target. Use when components are selected and you need supply-chain feasibility.
---

# BOM Audit

## Pre-flight
- `ELECTRONICS-ARCH.md` + `SCHEMATIC-SPEC.md` committed (or comprehensive enough to draft from)
- `MATERIALS.md` (for enclosure components, PCB substrate)
- Production volume target known (drives cost-class)

## Dispatch
Invoke `bom-supply` agent with:
- Architecture + schematic spec + materials
- Production volume target
- BOM cost target
- Geography (some suppliers are geography-restricted)

## After agent returns
Verify:
- Every line has supplier part number (no generic "100nF X7R")
- Two alternates for critical ICs
- Lifecycle status column populated (Active / NRND / EOL)
- Lead time column populated (long-lead flagged)
- Cost-class at stated volume
- RoHS-3 compliance per line
- Risk summary at top (single-source, allocation, lifecycle)
- Total BOM realistic vs target

## Recommend next
- `/hardware-product-freedom:compliance` — RoHS audit if any flagged
- `/hardware-product-freedom:cm-select` — submit BOM with CM RFQs
- Loop back to `electronics-architect` if BOM exceeds budget significantly

## Anti-patterns
- ❌ Generic part numbers
- ❌ No lifecycle column
- ❌ No alternates
- ❌ Cost without volume tier
- ❌ Forgetting to include PCB + enclosure + assembly costs
