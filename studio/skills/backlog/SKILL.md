---
description: Maintain BACKLOG.md with numbered FEAT-N items that have concrete success criteria, effort estimates, and lifecycle markers. Use when adding a new feature idea to backlog, closing a completed FEAT, or when the user asks "add to backlog" / "file this for later" / "close FEAT-N". Not for schematic-defect bug-fix items (those belong in the spec under P1/P2/P3 labels).
---

# Backlog

BACKLOG.md is where **discretionary feature-level work** lives. It's different from:
- **Bug tracker** (tag-level release notes — see `changelog-discipline`)
- **Spec punch-list** (P1/P2/P3 schematic or contract deviations — live in the spec itself)
- **Handoff docs** (active investigations — see `handoff-doc`)

Items in BACKLOG are **upgrades, not corrections**. They're worth doing but not urgent.

## Structure

```markdown
# <project> backlog — future features

**Baseline:** `v<x.y.z>` (<milestone>).

<1-paragraph statement of what's tracked here and what's NOT>.

---

## FEAT-1: <Name>

**Context:** <Why this matters, user rationale, community signal>.

**Scope:**
- <bullet 1>
- <bullet 2>

**Effort:** <1 session | 1 week | 1 month>

**Success criteria:**
- <functional condition 1>
- <functional condition 2>
- <test-pass criterion>
- <user-perceptible criterion, functionally framed>

**Related:**
- <doc>
- <tag>
- <handoff>

---

## FEAT-2: ...

---

## Backlog policy

<what goes here, what doesn't, how items move>
```

## Writing a new FEAT-N

- **Number sequentially.** Never reuse a number, even if FEAT-N was closed. Numbering = stable identity.
- **Name as noun phrase.** "JFET buffer top-notch" not "improve JFET".
- **Context first.** Why does this matter? Tie to user feedback, spec, community convention, measurement-backed regression, etc.
- **Scope as bullets.** 2-6 bullets. Not a mini-plan, not a one-liner.
- **Effort in honest units.** "1-2 session arc", not "medium".
- **Success criteria as booleans.** Each criterion can be checked off or not. No "improved".

## Lifecycle

A FEAT goes through states. Always keep the history visible — don't delete.

```markdown
## FEAT-7: Volume saturation accuracy — CLOSED in v0.20.8 (2026-04-23)

**Status:** RESOLVED in v0.20.8 via <short mechanism>.

<concrete summary of how success criteria were hit>

Success criteria hit:
- <criterion> ✓ <evidence>
- <criterion> ✓ <evidence>

### Original context (superseded by v0.20.8 resolution):
<preserve the pre-close FEAT body>
```

Other lifecycle markers:
- **OPEN** (default) — no marker needed.
- **IN PROGRESS** — append `— IN PROGRESS on <branch>` to the heading.
- **BLOCKED BY FEAT-N** — append and explain.
- **DEFERRED** — append and give date / reason.
- **ABANDONED** — append and explain why; keep the body for search value.
- **CLOSED** — as shown above.

## Promotion to active work

A FEAT is promoted when:
1. User explicitly approves scope + timing, OR
2. It's unblocked by a closed FEAT that was blocking it, OR
3. A measurement shows it's become urgent (e.g. performance regression cause).

When promoted, create an investigation branch (`/studio:investigation-branch`) or start direct work on main per the orchestrator's proposal. Update the FEAT heading to `— IN PROGRESS on <branch>`.

## Closing a FEAT

When the fix ships:
1. Update the FEAT heading to `CLOSED in v<x.y.z> (<date>)`.
2. Add the **Success criteria hit** block with evidence.
3. Preserve the original body as `### Original context (superseded by ...):`.
4. Reference the closing tag's CHANGELOG entry.
5. Commit as part of the same tagged commit that ships the fix.

## What does NOT belong in BACKLOG

- Bug fixes — those ship in a tagged version directly.
- Schematic / contract defects — those live in the spec's P1/P2/P3 punch-list.
- Work-in-progress (active) — that's a handoff or a todo list.
- One-off user requests — ship them and note in CHANGELOG.

## Sanity checks

```bash
# Every FEAT has success criteria
grep -B1 "^## FEAT-" BACKLOG.md   # spot-check structure

# Closed FEATs reference the closing tag
grep "CLOSED in v" BACKLOG.md
```
