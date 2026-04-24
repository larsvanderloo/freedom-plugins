# HANDOFF — <Topic> (<Date>)

**Status:** <in-progress | shipped-with-workaround | blocked | completed>
**Current tag:** <v0.x.y>
**Related tags:** <v0.x.y-previous>, <v0.x.y-failing-state>
**Goal for next session:** <one-line>

---

## TL;DR

<3-5 sentences. What broke, what's shipped, what's unresolved. Concrete numbers.>

---

## Git state (verify before starting)

```bash
cd <repo-path>
git log --oneline -5
# expect:
#  <hash> <msg>
#  <hash> <msg>
#  ...

git tag --sort=-v:refname | head -3
# expect:
#  v<current>   ← shipping
#  v<previous>
#  v<failing>   ← reproducer — do NOT untag

git branch --show-current
# expect: <branch>
```

If any of these don't match, **stop and investigate the drift before proceeding**.

---

## Reproducing the failing state

```bash
# 1-line or short-script repro. Include expected numerical output.
<command>

# Expected:
# <output snippet>
```

---

## Summary of measurements

| State | Metric A | Metric B | ... |
|---|---:|---:|---|
| baseline | | | |
| broken   | | | |
| current  | | | |

---

## Hypotheses (ranked by cost — try cheapest first)

### H1: <Name>
- **Rationale:** <why this could be the cause>
- **Test:** <exact command / file edit / grep>
- **Cost:** <5 min | 30 min | 1 day>
- **If confirmed:** <fix direction>
- **Status:** <untested | rejected | confirmed>

### H2: <Name>
<same structure>

### H3: ...

---

## Investigation recipe (step-by-step)

1. **<First step>** — <command>
   - If <signal>: <action>, **done**.
   - If not: proceed to step 2.

2. **<Second step>** — ...

3. ...

---

## Success criteria for the fix

- [ ] <Functional, testable condition 1>
- [ ] <Functional, testable condition 2>
- [ ] Full test suite passes (`<test-command>`)
- [ ] No regression in <measured baseline>
- [ ] <User-perceptible criterion, if any — phrased functionally>

---

## Files to read first

1. `<path>:<line-range>` — <why>
2. `<path>:<line-range>` — <why>
3. `<path>` — <why>

---

## Relevant artefacts

| Path | Purpose | Regenerable? |
|---|---|---|
| `/tmp/<probe>.cpp` | <description> | yes — from `/tmp/<source>` |
| `/tmp/<data>.csv`  | <description> | no — captured live |
| `<repo>/reference/<wav>` | <description> | yes — via <command> |

---

## Out of scope for next session

- **Do not** revert the <v0.x.y-failing-state> tag — it's needed as the A/B reference.
- **Do not** touch <unrelated-system>.
- **Do not** upgrade <dependency> — pinned for <reason>.

---

## Notes

- User memory: <relevant memory items>
- Related docs: <paths>
- Related PRs / issues: <links>
- Claude model / session date: <info>

---

*Written <date> by <session>. Good luck next session.*
