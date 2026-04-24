---
description: HIGHEST-PRIORITY INCIDENT RESPONSE skill — invoke whenever production is down, a deploy just failed, users are affected, or a recent release broke things. The default action for "we're down" / "prod is broken" / "deploy failed" / "revert now" is ALWAYS "restore the last-known-good state as a numbered rollback release" — NOT "start investigating the cause". Investigation happens AFTER rollback. This skill ships the rollback as an explicit numbered tag with CHANGELOG entry (not a silent `git revert`), re-pins dependencies where applicable, and files a handoff tracking the proper fix. Use WHENEVER the user signals urgency ("we're down", "users can't log in", "prod is broken", "deploy failed"), not only when they literally say "rollback". Also use when a silent `git revert` happened and the release needs formalising. When urgency is present, this skill dispatches BEFORE investigation-branch — every time.
---

# Rollback Release

A rollback is a **release**, not a reversion. It restores a good production state, makes the rollback auditable, and preserves the failing-state tag for future root-cause work.

## When to roll back (vs. fix forward)

Roll back when:
- User is affected in production right now
- Root cause investigation will take ≥1 session
- The previous version is known-good

Fix forward when:
- Root cause found in <1 hour
- No production impact (pre-release, test environment)
- Reverting would lose important WIP

## The protocol

### 1. Confirm the good state

Identify the last tag / commit / version that worked. Verify it:
- Runs cleanly on the current environment (e.g. rebuild + test)
- Matches what was shipped last (plugin binary, npm package, Docker image, etc.)

Do NOT roll back to a tag that itself has known issues — that just moves the bug.

### 2. Decide on the rollback version number

- **Plugin / wrapper:** bump patch (e.g. v0.20.5 → v0.20.6 rollback). Never reuse a version number.
- **Core library / engine:** leave the core tag where it is. The rollback happens at the consumer (wrapper / pin) layer.

This preserves the failing-state tag (v0.20.5) in git AND makes the rolled-back state (v0.20.6) its own discoverable release.

### 3. Re-pin dependencies (if applicable)

For a distributed plugin / package that depends on another tagged artefact:

```cmake
# In the wrapper's CMakeLists.txt or package.json:
# Was:
GIT_TAG v0.20.5   # regression
# Becomes:
GIT_TAG v0.20.4   # proven baseline, pending fix per HANDOFF-*.md
```

Leave a comment pointing to the handoff that tracks the fix.

### 4. Rebuild + verify

- Rebuild the rolled-back version.
- Reinstall (for plugins / binaries).
- Run validation (e.g. `auval` for AU, pluginval, integration tests).
- Verify the known regression is gone.

If you can, also verify the *expected* baseline behaviour with a clean render / smoke test.

### 5. Write the CHANGELOG entry — explicit rollback

```markdown
## [0.20.6] — <date> (ROLLBACK: <consumer> re-pinned to <dep>@v<good>)

<1-paragraph: what the regression was (quote the user report), measurement if any, what's rolled back, what's preserved>.

**This release re-pins <dependency> from v<regressed> back to v<good>** while
the root cause is investigated. <What the user loses temporarily>, but
<what they regain> is restored.

<Reference to the handoff that tracks the fix>. A proper fix ships as
v<x.y.z+fix> once the root cause is identified.

No <audio | UI | business-logic> code changes in this release — purely
a <dep>-pin rollback.
```

The key phrases:
- "ROLLBACK:" in the headline (scannable)
- "while the root cause is investigated" (sets expectation)
- "A proper fix ships as v<next>" (sets expectation)
- Link to the HANDOFF doc (makes it findable)

### 6. Tag + commit

```bash
git add CHANGELOG.md <pin-files>
git commit -m "v0.20.6: rollback <dep> pin to v0.20.4 (v0.20.5 <regression-summary>)"
git tag -a v0.20.6 -m "v0.20.6 — rollback to <dep>@v0.20.4 (pending fix)"
```

Don't force-push. Don't untag v0.20.5. Both versions must remain discoverable.

### 7. File a handoff (if not already)

The rollback is only valid if someone (future you) is going to chase the root cause. Ensure a `HANDOFF-<topic>.md` exists (via `/session-discipline:handoff-doc`) that describes:
- What's being investigated
- Why the rollback was chosen over fix-forward
- The reproduction steps using the preserved failing-state tag

Without a handoff, a rollback becomes "we gave up" — which may be fine but should be explicit.

### 8. Notify

If there's a downstream consumer (marketplace listing, user base, team channel), communicate:
- The rollback version number
- What they lose (feature regressions)
- Expected timeline for the proper fix (if known)
- How to opt back into the failing version if they want to help debug

## What NOT to do

- ❌ **Don't `git revert` the regressing commit on the main branch.** That loses the commit's code — and you may want to fix forward later from that state.
- ❌ **Don't retag the failing version as good.** Untagging / retagging is destructive history-rewriting.
- ❌ **Don't rollback without a CHANGELOG entry.** Silent pin-downgrades are confusing.
- ❌ **Don't rollback and forget to file a handoff.** That's how root causes disappear.
- ❌ **Don't number the rollback backwards.** v0.20.5 is regressed → next release is v0.20.6, not v0.20.4.1.

## Example

From ods-engine:

```
v0.20.4   shipped — baseline working
v0.20.5   shipped — broke clean-channel solver (HF noise regression)
v0.20.6   ROLLBACK — plugin re-pinned to engine v0.20.4. HANDOFF-v0.20.5-clean-preamp-noise.md written. User-visible: clean again, Volume-character temporarily regressed to level control.
v0.20.7   proper fix (workaround) — cathode sinks instead of rail change, preserves user-perceptible Volume character.
v0.20.8   root-cause fix — damped NR, retires workaround, v0.20.5 wiring restored.
```

v0.20.5 is preserved as the reproducer. v0.20.8 closes the handoff.
