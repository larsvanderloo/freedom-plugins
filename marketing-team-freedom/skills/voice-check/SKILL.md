---
description: Validate copy (any Markdown file under campaigns/) against BRAND-VOICE.md before shipping. Dispatches brand-voice-guardian agent. Returns a severity-labelled review — BLOCKER / MAJOR / MINOR issues with suggested rewrites. Never auto-rewrites; user or copywriter applies fixes. Use before marking any piece as "shipped" or sending to client, and after each channel adaptation.
---

# Voice Check

Wraps the `brand-voice-guardian` agent. Non-destructive — flags issues, proposes rewrites, never edits the copy itself.

## Pre-flight

1. **`BRAND-VOICE.md` exists and is current.** If it's stale (>3 months unchanged while brand has evolved), recommend `strategist` refresh first.
2. **Target piece is identifiable.** User can point at:
   - A single file: `voice-check the launch email`
   - A folder: `voice-check all the launch-campaign drafts`
   - A campaign: `voice-check campaign launch-2026`

## Dispatch pattern

Invoke `brand-voice-guardian` with:
- `BRAND-VOICE.md` path (the contract)
- `AUDIENCE.md` path (audience-context checks)
- Target file(s) to review
- Severity threshold (default: report all severities; option to suppress MINOR for time-pressed reviews)

## After the guardian returns

1. Report the summary verdict (ready / revisions / rewrite).
2. If BLOCKERS: block ship, route to `copywriter` with the specific issues for fix.
3. If MAJORS only: present to user — they decide ship vs fix.
4. If MINORS only: user can ship; optionally pass back to copywriter for polish.

## Escalation

- If the same MAJOR keeps surfacing across multiple pieces, the voice guide itself may be unclear or incomplete. Suggest a `strategist` update to `BRAND-VOICE.md` to clarify the rule.
- If a BLOCKER pattern repeats per piece, escalate to the user: "The copywriter is consistently producing copy that violates rule X — propose re-briefing or voice-guide clarification."

## When to SKIP voice-check

Very rarely. But:
- **Transactional copy** (receipts, password-reset emails, error messages) may intentionally be voice-minimal — skip if the piece isn't a brand touchpoint
- **External partner content** (guest post, podcast appearance notes) — voice-check for conflicts but don't expect full compliance
- **Truly internal comms** (dev-team updates) — voice discipline is usually optional

Default: always run voice-check on customer-facing copy.

## Don't

- ❌ Approve copy because "it sounds fine" without reading `BRAND-VOICE.md` first
- ❌ Let the agent auto-rewrite; it should only propose
- ❌ Skip voice-check under deadline pressure — that's exactly when voice drift creeps in
- ❌ Ignore MINORs entirely — stack of them across one piece is a pattern worth addressing
