---
description: Write a creative / campaign brief that agents downstream (copywriter, hook-writer, channel-adapter) can actually execute against. Forces the brief to have channel, goal, persona target, pillar, CTA, constraints, and a deadline — no vague "write something for the launch" briefs. Use when starting any new piece of copy, campaign, or channel push. Saves to campaigns/<campaign-name>/brief.md. Triggered by "write a brief", "I need a brief for X", "let's start a campaign for Y", or when the marketing-orchestrator dispatches.
---

# Brief

A marketing brief is a contract. Every downstream agent reads it as ground truth. If the brief is vague, every derivative piece will be vague. This skill enforces specificity at brief-time so the drafting stage has what it needs.

## The template

Save to `campaigns/<campaign-name>/brief.md`:

```markdown
# Brief — <campaign or piece name>

**Date:** <YYYY-MM-DD>
**Author:** <user / agent>
**Deadline:** <YYYY-MM-DD> — <why that date matters>
**Status:** draft / approved / in-progress / shipped

---

## Goal

**Primary objective (one sentence):**
<what this piece is for — e.g., "Drive signups for the <date> webinar from existing newsletter readers">

**Success metric:**
<how we'll know it worked — specific number if possible>

**Funnel stage:**
- [ ] Awareness
- [ ] Consideration
- [ ] Decision
- [ ] Retention / expansion

---

## Audience

**Primary persona (from AUDIENCE.md):** <name>

**Specific cut of that persona for THIS piece:**
<if broader — e.g., "Primary persona, but specifically those who've attended a previous event">

**Awareness stage for this audience cut:**
<unaware / problem-aware / solution-aware / product-aware / most-aware>

**What they already know / believe:**
<context the piece doesn't need to re-establish>

---

## Message

**Messaging pillar (from MESSAGING-HIERARCHY.md):**
<which of the 3-5 pillars this piece expresses>

**One idea this piece delivers:**
<if you can't name one idea, the piece will be diffuse>

**Proof points to include:**
- <from POSITIONING.md or campaign-specific research>
- <another>

**What NOT to say:**
<topics / angles that are out of scope — prevents scope creep in drafts>

---

## Call to action

**Primary CTA (exact words):** "<verb + specific noun>"
**Where it leads:** <URL / destination>
**Secondary CTA (if any):** "<verb + noun>"

---

## Channel & format

**Channel(s):** <email / landing / blog / social-twitter / linkedin / ...>
**Format:** <if channel-ambiguous — e.g., "LinkedIn post" vs "LinkedIn carousel">
**Length target:** <word count OR char limit OR slide count>
**Tone note (if channel-specific):** <anything that varies from BRAND-VOICE.md default>

---

## Constraints

- <technical — e.g., "No images, text-only">
- <legal — e.g., "Legal must review pricing mentions">
- <brand — e.g., "No mention of competitor X by name">
- <timing — e.g., "Must land before <event>">

---

## References

- <path to source research / data / customer quote that informs this>
- <link to similar past piece that worked / didn't>

---

## Open questions

- [ ] <question that must be answered before drafting>
- [ ] <another>
```

## How to collect a good brief

If the user asks for a brief with sparse input, **interview**:

1. **Goal first.** "What's this FOR?" If the user says "to raise awareness", push for specifics: who, why now, what action.
2. **Audience second.** "Who specifically? Point me at the `AUDIENCE.md` persona, or tell me why this is a different cut."
3. **Message third.** "One idea. Not three. What's the one thing?"
4. **CTA.** "What happens if this lands? What do they do next?"
5. **Channel + constraints.** Once above is locked, format becomes straightforward.

Don't skip questions because the user has limited time. A 10-minute brief prevents a 3-hour copy round-trip.

## Handoffs

- Committed brief → dispatch `copywriter` for body
- Brief has unanswered strategy questions → dispatch `strategist`
- Brief is approved and copy is in-progress → update `status:` in the brief

## Anti-patterns

- ❌ "Brief" that's just a title and a deadline
- ❌ Multiple competing goals ("drive signups AND newsletter subscribers AND product awareness")
- ❌ Vague CTA ("encourage action", "get people interested")
- ❌ Audience = "our customers" (too broad — specify the persona cut)
- ❌ Skipping "What NOT to say" — this is where scope creep enters drafts
