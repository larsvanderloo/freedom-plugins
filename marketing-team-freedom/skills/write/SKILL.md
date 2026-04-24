---
description: Dispatch to the copywriter agent with a specific brief + channel to produce a draft. Shortcut for common channels — "write the email", "draft the landing page", "draft a twitter thread". Reads the campaign's brief.md + the strategy files, routes to copywriter with full context. Outputs to campaigns/<campaign>/copy/<channel>.md. Use when a brief is committed and you need copy now.
---

# Write

Wraps the `copywriter` agent in a one-command invocation. Before dispatching, ensures preconditions are met.

## Pre-flight checks

Before dispatching `copywriter`, verify:

1. **Brief exists.** Find the active campaign's `brief.md`. If it doesn't exist, invoke `/marketing-team-freedom:brief` first — don't write copy against a missing brief.
2. **Strategy files exist.** `POSITIONING.md`, `AUDIENCE.md`, `BRAND-VOICE.md` must all be readable. If any are missing, dispatch `strategist` first.
3. **Channel is specified.** User should name the channel explicitly ("write the email", "write the landing page"). If ambiguous, ask.
4. **Not already drafted.** Check `campaigns/<campaign>/copy/<channel>.md` — if it exists, ask user whether they want a new version (v2) or overwrite.

## Dispatch

Invoke the `copywriter` agent with a prompt that:
- References the brief path explicitly
- References the strategy file paths
- States the target channel
- Asks for Draft v1 saved to `campaigns/<campaign>/copy/<channel-slug>.md`
- Requests "flag any positioning gaps you notice during drafting"

## After copywriter returns

Read their output. Report to the user:
- Where the draft is saved
- Any gaps the copywriter flagged (strategy issues, missing proof, persona mismatch)
- Recommended next step:
  - If body is good but hook is weak → `/marketing-team-freedom:hooks` to sharpen
  - If body is good and hook is fine → `/marketing-team-freedom:voice-check` before shipping
  - If copywriter flagged strategy issues → `strategist` refresh

## Multi-channel shortcut

If user says "write the email + landing + LinkedIn post", don't dispatch once with all three — briefs have channel-specific fields. Instead:
1. Confirm each channel shares the same brief OR propose a split if goals diverge
2. Dispatch `copywriter` once per channel, in separate agents
3. Aggregate outputs in a single report

For repurposing existing content across channels, use `/marketing-team-freedom:adapt` instead — that uses the `channel-adapter` agent which is optimised for repurposing (not writing from scratch).

## Anti-patterns

- ❌ Writing the copy yourself. Dispatch to `copywriter`.
- ❌ Skipping the pre-flight checks "just this once".
- ❌ Dispatching without specifying a channel — drafts become generic.
- ❌ Silently overwriting an existing draft — confirm with user first.
