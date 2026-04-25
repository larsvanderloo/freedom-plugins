---
description: Write a structured campaign post-mortem — what we shipped, what the result was, what worked, what didn't, what we'd change, and what learnings feed back into strategy files. Saves to post-mortems/<campaign>-<date>.md. Non-blame, learning-oriented. Use after a campaign concludes (positive or negative result), or when a piece significantly over/under-performs expectations. Cross-references CHANGELOG if studio is installed.
---

# Post-mortem

Marketing post-mortems are where learnings survive. Without them, every campaign starts from scratch and the same mistakes replay.

This skill writes a structured post-mortem that:
- Documents what actually shipped (for memory)
- Captures the outcome (measured if possible, qualitative if not)
- Extracts what WORKED and what DIDN'T, separately
- Proposes specific updates to `POSITIONING.md` / `AUDIENCE.md` / `BRAND-VOICE.md` / `CONTENT-CALENDAR.md` based on learnings
- Feeds forward: next-campaign recommendations

## Template

Save to `post-mortems/<campaign-slug>-<YYYY-MM-DD>.md`:

```markdown
# Post-mortem — <campaign name>

**Campaign dates:** <start> → <end>
**Author:** <user / agent>
**Review date:** <YYYY-MM-DD>
**Brief reference:** `campaigns/<campaign>/brief.md`

---

## What we shipped

| Channel | Piece | Date | Link/path |
|---------|-------|------|-----------|
| <channel> | <title> | <date> | <path> |
| ... | ... | ... | ... |

---

## Outcome

### Metric targets (from brief)
- <metric>: target <N>, actual <N> (<+/-%>)
- <metric>: target <N>, actual <N>

### Qualitative signals
- <customer feedback verbatim quote>
- <sales team / support observations>
- <social sentiment>
- <what the audience re-shared / didn't>

### Overall
- [ ] Exceeded expectations
- [ ] Met expectations
- [ ] Underperformed

---

## What worked

### <Theme — e.g., "Hook set C resonated">
**Evidence:** <specific — open rate, share count, quote, etc.>
**Why (hypothesis):** <why we think this landed>
**Carry forward:** <what we should repeat or systematise>

### <Another theme>
...

---

## What didn't

### <Theme — e.g., "Pillar 2 landing page underperformed">
**Evidence:** <specific number or signal>
**Why (hypothesis):** <candidate causes, ranked by likelihood>
**Avoid:** <what to stop doing>

### <Another>
...

---

## Root-cause hypotheses (for underperforming pieces)

For each underperforming piece, what's the most plausible cause?

1. **Strategy (positioning / audience / message mismatch):** <if yes, evidence>
2. **Execution (voice drift, weak hook, unclear CTA):** <if yes, evidence>
3. **Channel (wrong format for the medium, timing off):** <if yes, evidence>
4. **External (macro event, competitor launch, algo change):** <if yes, evidence>

---

## Strategy file updates

Based on learnings, propose updates:

### `POSITIONING.md`
- [ ] <proposed change — e.g., "Clarify differentiator line — 'X' didn't land, try 'Y'">

### `AUDIENCE.md`
- [ ] <proposed change — e.g., "Primary persona JTBD might actually be Z, not W">

### `BRAND-VOICE.md`
- [ ] <proposed change — e.g., "Add 'concrete-numbers > abstract-claims' as an always-rule">

### `MESSAGING-HIERARCHY.md`
- [ ] <proposed change — e.g., "Pillar 2 is actually Pillar 1 for the SMB segment">

### `CONTENT-CALENDAR.md`
- [ ] <cadence or balance adjustments>

---

## Recommendations for next campaign

- <specific — e.g., "Lead with pillar 3 on LinkedIn; pillar 1 underperformed there despite working on email">
- <specific>
- <specific>

---

## Out of scope for follow-up

- <explicit — don't chase these if they come up>

---

## CHANGELOG cross-reference

If `studio` is installed, this post-mortem should be referenced from the project's CHANGELOG entry for the campaign. Linked entries: <list>.

---

*Post-mortems are non-blame documents. They identify patterns, not people.*
```

## How to conduct one

### 1. Gather data first, don't start writing
- Pull metrics from wherever they live (email platform, ad platform, analytics)
- Collect qualitative signals (customer quotes, sales feedback, support tickets mentioning the campaign)
- Review the original `brief.md` for what was promised

### 2. Separate "what worked" from "what didn't"
Don't conflate. A campaign can over-perform on one metric and under-perform on another, and the reasons are usually different. Give each its own section.

### 3. Hypothesise causes, don't declare them
Use "hypothesis" language. You rarely know for sure what caused a result — propose plausible causes, flag evidence, and invite follow-up tests.

### 4. Feed learnings back
The most common post-mortem failure mode is writing one and never updating `POSITIONING.md` based on it. The strategy files are where institutional memory lives. If a post-mortem doesn't propose at least one strategy-file update, it's probably too shallow.

### 5. Don't blame individuals
Post-mortems are about patterns. "The copywriter messed up" is never the learning. "Our briefing skipped X, so drafts lacked Y" is a learning.

## When to run a post-mortem

- After any campaign wraps (default: yes)
- After any piece over/under-performs by >50% vs expectation
- Quarterly roll-up across several campaigns to spot patterns
- Before a follow-up campaign that's attempting to address a previous miss
