---
description: Contract manufacturer (CM) selection + tooling strategy + pilot run + first article inspection planning. Dispatches manufacturing-ops agent. Reads CAD-SPEC + MATERIALS + BOM + COMPLIANCE-ROADMAP + production volume target. Produces MANUFACTURING-PLAN.md with vendor candidate matrix, RFQ template, tooling strategy (soft-tool vs hard-tool decision), pilot-1 + pilot-2 + production ramp procedures, FAI specifications, quality gates. Use when design is freeze-quality and you need to plan production.
---

# CM Select

## Pre-flight
- `CAD-SPEC` + `MATERIALS` + `BOM` + `COMPLIANCE-ROADMAP` all draft-complete (CM needs these to quote)
- Production volume target locked (year 1 + year 2 forecast)
- Geography preference (Asia-Pacific / Mexico / EU / US)
- Target unit cost class

## Dispatch
Invoke `manufacturing-ops` agent with:
- All design + BOM + compliance docs
- Volume target + price target + geography preference
- User notes on CM constraints (capacity, MOQ, NDA, IP concerns)

## After agent returns
Verify:
- CM candidate matrix has 3-5 evaluated candidates
- Selection criteria explicit and weighted (audio experience, volume capacity, lead time, quality systems, compliance support)
- RFQ template ready to send to top 3
- Tooling strategy aligns with volume (soft-tool low volume, hard-tool high)
- Pilot-1 + pilot-2 + production-1 phases distinguished, each with quality gates
- FAI procedure covers mechanical + electrical + audio + compliance + documentation
- Ramp schedule realistic (typically 24-32 weeks design freeze → first sale)

## Recommend next
- Send RFQ to top 3 candidates
- NDA in place before sending RFQ
- Engineering sample build (10-20 hand-assembled units) BEFORE pilot-1
- Ramp into pilot-1 once CM is selected and PO issued

## Anti-patterns
- ❌ Skipping pilot-2 (engineering build to mass production is too far a jump)
- ❌ Single-CM strategy (loses leverage)
- ❌ Hard-tooling at low volume forecast
- ❌ Vague RFQ (CMs can't quote without complete docs)
- ❌ No quality gates between phases
