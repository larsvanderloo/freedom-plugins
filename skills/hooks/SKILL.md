---
description: Generate headline / subject-line / CTA / social-hook options (8-15 at a time, labelled by archetype) for a specific piece. Dispatches the hook-writer agent with full strategy context. Output is an options-list for the user to pick from — not one "best" pick. Use when you need the first 3-12 words of anything to land, or when a body copy is solid but its hook is weak. Explicit channel + char-limit awareness.
---

# Hooks

Wraps the `hook-writer` agent to produce labelled headline/subject-line/CTA option sets.

## Pre-flight checks

1. The **copy this hook leads to** exists (or a brief exists explaining what the hook promises). Without knowing what the body delivers, hooks become disconnected from the piece.
2. **Channel specified** — "email subject", "landing page H1", "Google ad headline", "LinkedIn post opener". Char limits and norms vary drastically.
3. **Strategy files readable** — `POSITIONING.md`, `AUDIENCE.md`, `BRAND-VOICE.md`.

## Dispatch pattern

Invoke `hook-writer` with:
- Path to the body / brief
- Target channel + char limit
- CTA the hook must preview
- Any voice constraints (e.g., "no emojis for this audience")

## Output location

`campaigns/<campaign>/hooks/<channel>-<what-it-hooks>.md` — e.g., `hooks/email-webinar-invite.md`, `hooks/landing-h1-feature-launch.md`.

## After hook-writer returns

1. Read the options list.
2. Present the top 3 picks to the user with the hook-writer's reasoning.
3. Optional: dispatch `brand-voice-guardian` to voice-check the top 3 before user locks.
4. If user is genuinely torn between 2 top picks, escalate to `/session-discipline:ab-audition` — have them run both in the real channel and let audience decide.

## Don't

- ❌ Produce one polished pick. The value of this skill is option-volume.
- ❌ Skip voice-check on the top 3 — hook-writer is optimised for impact, not brand alignment.
- ❌ Use question-archetype hooks by default. Most are weak. Only if the pain is verbatim.

## When to reinvoke

- First set was voice-off → give feedback to hook-writer, ask for a new set
- First set missed the persona's vocabulary → run `strategist` to re-check AUDIENCE.md, then reinvoke
- First set's archetypes were all one flavour → reinvoke with explicit "produce Set D (contrarian) + Set E (numbers) specifically"
