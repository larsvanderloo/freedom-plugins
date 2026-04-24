---
description: Run a disciplined multi-step investigation on a DEDICATED BRANCH with cost-ordered hypothesis testing and --no-ff merge. DO NOT invoke on a vague one-liner like "investigate X", "debug Y", "look into the memory leak", "find the bug" — those are plain debugging, not branch-based investigations (the scale is unknown). Invoke ONLY when at least TWO of these scale signals are present in the user's message: (a) user lists ≥3 hypotheses / theories / "I think it might be X or Y or Z", (b) user mentions prior failed fix attempts ("I've tried X and Y already"), (c) user estimates effort ≥1 hour / ≥1 day, (d) user flags hard-to-reproduce character ("elusive", "only in prod", "intermittent", "can't repro locally"), (e) user asks to resume from a HANDOFF-*.md, (f) user explicitly says "set up the investigation" or "let's investigate properly". If ONLY ONE signal is present, default to plain debugging and only branch if complexity emerges. For production-down incidents, rollback-release takes priority — investigate after the rollback, not before.
---

# Investigation Branch

A disciplined structure for non-trivial debugging. Optimises for:
- **Reproducibility** — repro environment is preserved until the root cause is found.
- **Cost-ordered exploration** — cheap tests come first, expensive tests come last.
- **Historical trace** — every rejected hypothesis is preserved in commits + the closing CHANGELOG entry.
- **Clean merge** — main stays green while you thrash.

## When to use

- You have a reproducible bug but don't know the cause
- ≥3 plausible hypotheses
- Expected effort: ≥1 hour
- You might need to revert diagnostic changes

Not for: typos, obvious fixes, known solutions.

## The protocol

### Phase 1 — Branch

```bash
git status                        # verify clean
git checkout -b investigate/<topic>
```

Naming convention: `investigate/<topic>` where `<topic>` is a short-slug summary of what you're investigating. Examples: `investigate/clean-preamp-noise`, `investigate/oauth-redirect-loop`.

### Phase 2 — Install the repro

Set up the branch in the exact state that reproduces the bug. This might mean:
- Temporarily reverting a workaround (so you can see the original failure)
- Toggling a feature flag / env var
- Forcing a specific code path

**Commit the repro setup as the first commit on the branch**, with a message like `investigate: install v0.x.y failing-state repro`. This way the repro is git-accessible for the rest of the investigation.

Verify the repro before moving on:

```bash
<repro command>
# Confirm output matches the handoff / bug report within a small tolerance.
```

If the repro doesn't match, **stop and investigate the drift** before continuing with hypotheses. You can't test hypotheses against a non-matching baseline.

### Phase 3 — Enumerate hypotheses (cost-ordered)

Write them down as H1, H2, ... — either inline as a commit message on the first commit, or in a `HANDOFF-<topic>.md` written via `/session-discipline:handoff-doc`.

Rank by **cost to test**, not by confidence. A 5-minute test you're 30% sure about comes before a 5-hour test you're 70% sure about, because you can run the cheap test and move on either way.

For each hypothesis, write:
- Rationale (why it could be true)
- Test (exact command / edit)
- Expected signal (what confirmation looks like)
- Fix direction (if confirmed)

### Phase 4 — Test in sequence

For each Hk in order:

1. **Make the diagnostic change.** Tiny, reversible. One variable at a time.
2. **Re-run the repro.** Capture numerical output.
3. **Interpret:**
   - If the signal is gone → Hk is confirmed or at least consistent. Don't stop yet — run other cheap Hs to make sure only Hk moves the needle.
   - If the signal is unchanged → Hk is rejected. **Revert the diagnostic change.** Don't let old instrumentation pile up.
4. **Commit the result**, even if rejecting. Message: `investigate: H<k> <rejected|confirmed> — <one-line evidence>`.
5. Update the HANDOFF doc or the TodoWrite list.

### Phase 5 — Once root cause is known

Design the **minimal fix**. Usually this is:
- Remove all diagnostic instrumentation
- Apply the smallest change that addresses the root cause
- Restore any workarounds being retired
- Update tests (old tests may have been calibrated to the buggy behaviour)
- Run full test suite
- Ship via `/session-discipline:changelog-discipline` with an investigation-timeline subsection

### Phase 6 — Merge back

```bash
git checkout main
git merge --no-ff investigate/<topic> -m "merge: <topic> investigation — <short resolution>"
```

`--no-ff` is important. It preserves the branch structure in `git log --graph`, so future archaeology shows the investigation as a distinct arc rather than a flat sequence of commits on main.

Tag the resulting merged state:

```bash
git tag -a v<x.y.z> -m "v<x.y.z> — <root-cause fix, one-liner>"
```

### Phase 7 — Close the loop

- Close related BACKLOG FEAT (if any): `/session-discipline:backlog` → mark CLOSED.
- Update any live HANDOFF doc: either merge into the CHANGELOG entry or mark it RESOLVED.
- If any tag (e.g. the failing-state) is still needed for A/B diagnostic work, say so explicitly — do NOT delete the tag.

## Guardrails

- **Never commit diagnostic instrumentation to main.** It must land on the investigation branch only, and be reverted before merge.
- **One variable at a time.** If you change two things and the signal moves, you don't know which caused the move.
- **Preserve the failing-state tag.** Even after shipping the fix, future devs may need to reproduce the original bug for regression tests.
- **Don't over-engineer the fix before exhausting hypotheses.** The "obvious" fix is sometimes wrong. Confirm the hypothesis first.

## Anti-patterns

- ❌ Starting the branch without repro verification.
- ❌ Hypotheses in confidence order instead of cost order.
- ❌ Testing H1 and declaring victory without running H2 as a control.
- ❌ Leaving instrumentation (`fprintf(stderr,...)` / `console.log` / etc.) in the final fix.
- ❌ Force-pushing or rebasing the investigation branch once others might use it.
- ❌ Fast-forward merge (`git merge --ff` or default). Always `--no-ff`.
