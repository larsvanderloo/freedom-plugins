---
description: Write a HANDOFF-<topic>.md for cross-session continuity when pausing mid-investigation or shipping work-in-progress. Forces repro steps, measurement tables, ranked hypotheses, cost-ordered investigation recipe, success criteria, and artefact index. Use when you're about to stop work on a non-trivial investigation and want the next session (or another dev) to be able to pick it up cold. Triggered by "write a handoff", "pause this investigation", "park this for tomorrow", or explicit `/studio:handoff-doc` invocation.
---

# Handoff Doc

A handoff doc is a self-contained note that lets a future session (or another developer) resume your investigation without reading the current session's transcript. It's the difference between "where were we" being a 30-minute archaeology session vs. a 30-second read.

## When to write one

- Ending a session with an investigation that's partially done
- Shipping a workaround while the root cause is still unresolved
- Handing off to a teammate
- Long debugging arc that might span multiple sessions
- Before a major refactor where understanding must survive the code change

Don't write a handoff for trivial 1-file fixes. Reserve for investigations with ≥3 hypotheses or ≥1 hour of context accumulated.

## The template

Save at the repo root (or under `docs/handoffs/` if that's the convention) as `HANDOFF-<topic>-<optional-date>.md`. See `references/template.md` for a ready-to-fill copy.

Required sections, in this order:

### 1. TL;DR
3-5 sentences. What was broken, what's currently shipped, what's unresolved. Cite version numbers and commit SHAs.

### 2. Git state (verify before starting)
The exact commands a future session should run to confirm the repo matches the world the handoff was written against. Include expected output.

```bash
git log --oneline -5       # expect: <hash> <msg>
git tag --sort=-v:refname | head -3   # expect: v0.20.8 / v0.20.7 / v0.20.5
git branch --show-current  # expect: main
```

### 3. Reproducing the failing state
One-liner or short script that produces the bug deterministically. Include expected numerical output so the next session knows the repro is valid. If repro requires a specific tag or branch, say so and give the checkout command.

### 4. Summary of measurements
Table-format. Concrete numbers, not prose. Example:

| State | Median | Max | Convergence |
|---|---:|---:|---|
| v0.20.4 baseline | −189 dB | −96 dB | 2-5 iter |
| v0.20.5 broken   | −126 dB | −67 dB | hits cap=10 |

### 5. Hypotheses (ranked, try in cost order)
One paragraph per hypothesis. Each must have:
- **Name + rationale**: why this could be the cause
- **Test**: what to run / grep / edit to confirm or reject
- **Cost**: "5 min" / "30 min" / "1 day"
- **If confirmed**: what the fix direction looks like

Rank by cost, not by confidence. The 5-minute test always comes before the 5-hour test.

### 6. Investigation recipe (step-by-step)
Concrete commands, in order, with decision points ("if noise drops, done; else proceed to H2"). Think of it as a script a future-you could execute in a trance.

### 7. Success criteria for the fix
Bullet list of testable conditions. Avoid subjective language ("sounds better"). Use functional framing ("Vol=0.9 out_THD ≥ 8 %", "23/23 ctest pass", "null depth ≤ −140 dB").

### 8. Files to read first
Ordered list of 3-6 files, with line-ranges when applicable. These are the files the resuming session should page into context immediately.

### 9. Relevant artefacts
Index of `/tmp/` files, probe binaries, scratch CSVs, scratch test files. Note which are regenerable vs which hold unique data.

### 10. Out of scope for next session
Explicit list of things NOT to touch. Prevents scope creep when the new session gets curious.

### 11. Notes
User-memory items, cross-references to other docs (research/, CHANGELOG entry numbers, commit SHAs), anything that doesn't fit above.

## Style rules

- **Numbers, not adjectives.** Never "pretty bad noise" — always "−126 dB median, 63 dB above baseline".
- **Exact commands.** Don't paraphrase shell — copy the real command with flags and args.
- **Link to tags, not "before the fix".** Git tags are stable; prose references rot.
- **Don't summarize code — link to it.** `sections/PhaseInverter.cpp:145-171` beats a prose paraphrase.
- **Date-stamp the file** in the opening metadata. Include the Claude model version if known.

## How to invoke

1. The user or orchestrator says "write a handoff for this".
2. Read `references/template.md`.
3. Fill every section based on the current session's context.
4. Write to the repo root as `HANDOFF-<slug>.md`.
5. Commit it as part of the same commit that ships the current state (so the handoff ships atomically with the WIP).

## Anti-patterns (don't do)

- ❌ Writing a handoff at the END of a session with no measurements captured during work.
- ❌ Hypotheses in confidence order (high → low) instead of cost order.
- ❌ Vague success criteria ("should work better").
- ❌ Omitting the git state section (future session can't trust the doc without verifying).
- ❌ Skipping "out of scope" — leads to the next session over-reaching.
