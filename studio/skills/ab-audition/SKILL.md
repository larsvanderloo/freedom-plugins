---
description: Run a structured A/B (or A/B/C) comparison for PERCEPTUAL or AESTHETIC choices where the USER makes the judgement — not Claude. Forces producing two or more labelled renderings / outputs / screenshots with identical inputs + measurements, and stopping until the user picks. Use for audio renders, UI variants, copy variants, ML-output comparisons, CSS tweaks, font choices — anything with a qualitative dimension. NOT for architectural / technology-stack / library-choice decisions (Postgres-vs-MongoDB, React-vs-Vue, algorithm-vs-algorithm) — those have objective tradeoffs and belong in brainstorming / design-discussion, not A/B audition. Also used to falsify earlier subjective claims. Triggered by "which looks/sounds better", "I'm torn between", "let's A/B", "pick one of these", or when Claude is tempted to volunteer "this is cleaner/better" on perceptual output.
---

# A/B Audition Framework

You are not the end user. Your "sounds better" / "feels cleaner" assessments are worth ~0 — the user's ears / eyes / judgement are worth everything. When a change has a perceptual or qualitative dimension, **produce A and B for the user to compare**, present them neutrally, wait for verdict.

This skill is domain-agnostic:
- **Audio:** A/B of rendered WAVs
- **UI / CSS:** A/B of screenshots or live previews
- **ML:** A/B of model outputs on the same prompts
- **Code style:** before / after diff with runtime behaviour unchanged
- **Content / copy:** two versions of the same section

## When to use

Use A/B when:
- A change has a qualitative / perceptual impact
- You're about to claim "this is better" based on your own judgement
- The user previously expressed a preference and the change may have violated it
- You have a hypothesis that "X will sound / look / feel better" but no measurement to prove it

Do NOT use A/B when:
- There's a deterministic correctness test (just run the test)
- The change is measurable (ship the measurement, not an A/B)
- The user has already approved the direction and is asking for execution

## The protocol

### 1. Produce A and B

A is the **baseline** (current state, previous version, reference).
B is the **candidate** (proposed change).

Both should be produced with **identical inputs** (same test signal, same prompt, same screen size, etc.). Keep everything else constant so the user is hearing / seeing only the delta.

Save with unambiguous filenames:
```
reference/audition-<topic>/
  A-baseline-<name>.wav
  B-candidate-<name>.wav
  README.md              # what changed, settings used, measurements
```

### 2. Measure what you can

Even though the user makes the judgement, measure everything that IS measurable:
- A/B null depth (audio) / pixel diff (UI) / token overlap (text) / etc.
- Level / loudness normalisation (so the user isn't fooled by volume differences)
- Relevant metrics (THD, CLS, BLEU, etc.) as a table

Present the measurements next to the A/B. The user compares perceptually AND sees the numbers.

### 3. Present neutrally

Never say "I think B sounds better" before the user listens. Never hint. Two valid presentation forms:

**Blind:** don't label A and B with which is baseline / candidate. Assigns without bias.
**Labelled:** label clearly (A = baseline, B = candidate) and let the user compare.

Default to labelled for efficiency; use blind when you suspect your own framing might bias the user.

### 4. Stop

Don't proceed until the user responds. Valid responses:
- **"Prefer A"** — revert the candidate. Don't ship.
- **"Prefer B"** — candidate approved. Proceed.
- **"Sounds the same / can't tell"** — important! Usually means the change is imperceptible. Ship B only if the measurement justifies it (e.g. performance win with null ≤ -140 dB). Otherwise consider reverting since complexity without perceptible benefit is debt.
- **"Both are bad, try X"** — new direction; run another A/B.

### 5. Document the verdict

If the user approves B, the CHANGELOG entry for the shipping version references the audition:

```markdown
### User A/B verdict
A (<baseline>) vs B (<candidate>), rendered at `reference/audition-<topic>/`.
User: "<quoted verdict>".
Null depth A vs B: <N> dB.
```

If the user rejects B, write a short postmortem in `research/audition-<topic>-postmortem.md` explaining why the proposed change was falsified. Even failed A/Bs are knowledge — next session should be able to search for "we already tried X".

## Falsifying subjective claims (important)

A/B is also the right response when someone (Claude, an agent, a research doc) claimed something would sound / feel better without producing the A/B. Example pattern:

> dsp-research-agent claimed nfbCoeff 2.5 → 10 would improve master tonality.
> → A/B rendered. User verdict: "nfb=10 sounds weird".
> → Postscript added to the research doc falsifying the original claim.
> → Settings stay at 2.5.

This pattern prevents agent hallucinations from becoming codebase reality. **Any research conclusion that has a perceptual dimension must be A/B-falsifiable before shipping.**

## The rendering / production step

Domain-specific. Examples:

### Audio (this project's native case)

```bash
# Identical input, identical controls, different engine tags
./process_wav input.wav reference/audition-X/A-baseline.wav <controls> # at v<A>
./process_wav input.wav reference/audition-X/B-candidate.wav <controls> # at v<B>

# Null test (measured)
./null_test A.wav B.wav
```

### Screenshot A/B (UI)

```bash
# Playwright / headless browser
# Render same URL with baseline CSS and candidate CSS
# Save as A.png, B.png
# Diff
compare -metric PSNR A.png B.png diff.png
```

### LLM prompt A/B

Render the same prompt with model-A and model-B (or prompt-A and prompt-B). Side-by-side in a markdown file.

## Anti-patterns

- ❌ Claude saying "B is cleaner" without the user auditioning.
- ❌ Normalisation skipped → user is comparing levels, not content.
- ❌ A/B buried in a big changeset → user can't isolate the delta.
- ❌ Shipping based on an A/B where the user said "I can't tell" (usually means the complexity isn't earning its keep).
- ❌ Not writing the postmortem when B is rejected (losing institutional knowledge).
