---
description: Maintain CHANGELOG.md as a first-class artefact — continuous (no gaps between tags), measurement-driven (before/after tables, not prose), investigation-aware (timeline of rejected hypotheses), and backfill-aware (detect gaps and propose filling them from git tag messages). Use when writing a CHANGELOG entry, bumping a version, or when the user asks "keep the changelog up to date" / "backfill the changelog" / explicitly invokes the skill.
---

# Changelog Discipline

CHANGELOG.md is not documentation you update after the fact — it's the primary artefact that encodes WHY each version exists. Treat it as a commit in its own right.

## Core rules

1. **Continuous.** Every git tag must have a CHANGELOG entry. Gaps are bugs.
2. **Top of file is latest version.** Newest entry always at the top, immediately after `# Changelog`.
3. **Measurements, not adjectives.** If the release changes behaviour, there's a table. If it changes performance, there's a benchmark delta.
4. **Link to tags, not SHAs.** `v0.20.4` stays meaningful; `3d9970f` rots.
5. **File changes list.** Every entry ends with "Files changed:" block.
6. **Test status.** "23/23 ctest pass" or "auval PASS" or equivalent.

## Entry template

```markdown
## [0.x.y] — <YYYY-MM-DD> (<one-line headline>)

### What this fixes
<User-reported symptom OR developer-observed issue. Concrete. Quote the report if user-facing.>

### Root cause (if non-obvious)
<One paragraph. Link to research/audit docs if they exist.>

### Fix
<What changed. Bullet list of specific edits with file paths.>

### Measured impact
<Table. Before / After / Target or Spec, for every metric that changed.>

| Metric | Before | After | Target |
|---|---:|---:|---:|
| <name> | | | |

### Files changed
- `<path>` — <what>
- `<path>` — <what>

### Test status
23/23 ctest pass. Plugin `auval` PASS. Null depth −185 dB vs −189 dB baseline.

### Notes (optional)
- <Caveats, known limitations, follow-up work>
- <Closes FEAT-N (if applicable)>
```

## Investigation-aware entries

When a fix took real debugging, include an **Investigation timeline** subsection between "Root cause" and "Fix". Format:

```markdown
### Investigation timeline (HANDOFF-<topic>.md)

- **H1 (<hypothesis>):** rejected — <why, with evidence>.
- **H2 (<hypothesis>):** rejected — <why>.
- **H3 (<hypothesis>):** confirmed — <evidence>.
- **Separate finding:** <anything unrelated but important that came out of the investigation>.
```

This serves as searchable dev history. Future-you grep-ing for a similar symptom will find this.

## Backfilling gaps

When the user asks to "keep the changelog up to date" or when you detect tagged versions with no CHANGELOG entry:

1. Find the gap: `git tag --sort=v:refname` and compare to `grep '^## \[' CHANGELOG.md`.
2. For each missing tag, run `git show <tag> --format='%B' --no-patch` to get the annotated message.
3. Reconstruct a condensed entry from the tag message. Keep it short — backfill entries don't need full measurement tables (data may be lost).
4. Mark it as backfill if the original was written much later: `*(backfilled <date>)*` footer.
5. Remove any existing "see git log for details" disclaimers that the gap made necessary.

## Release vs. rollback vs. workaround

Different entries for different reasons:

- **Release** (normal fix / feature): full template above.
- **Rollback**: see `/session-discipline:rollback-release` skill. Must be its own tagged version with its own entry — NOT an amended revert.
- **Workaround**: entry explicitly says "workaround pending <fix-tag>" and references the HANDOFF doc. Example:
  > "v0.20.7 uses cathode sinks as a workaround for the HC solver noise regression. Proper fix pending HANDOFF-v0.20.5-clean-preamp-noise.md H5 investigation."

## Cross-referencing

Each entry should link to:
- Handoff docs when a fix closes an investigation
- BACKLOG entries when a FEAT is closed
- Research docs / audit docs when the fix was informed by one
- Previous tags (especially the baseline and any failing-state tags needed for A/B)

## What NOT to put in CHANGELOG

- Internal chatter ("I thought about doing X but didn't")
- Every commit (that's git log's job)
- Stylistic opinions — "cleaner code" isn't a user-facing change
- Emojis (unless project convention — but default NO)
- "Bug fixes and performance improvements" — always specify

## Sanity-check commands

After writing or backfilling:

```bash
# Every tag has an entry
for tag in $(git tag --sort=v:refname); do
  grep -q "^## \[${tag#v}\]" CHANGELOG.md || echo "MISSING: $tag"
done

# Top of file is latest
head -3 CHANGELOG.md   # expect: # Changelog / blank / ## [<latest>]
```
