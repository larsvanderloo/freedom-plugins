# Scenario tests for SKILL description refinement

These 40 scenario prompts are the test harness used to iterate SKILL descriptions until Claude's invocation intuition matches intent.

Method:

```bash
# From a throwaway directory (DON'T run inside real project):
mkdir -p /tmp/sd-test-sandbox && cd /tmp/sd-test-sandbox && git init -q
echo "hello" > README.md && git add . && git -c user.email=t@t -c user.name=t commit -qm init

# Run:
claude --plugin-dir <path-to-session-discipline> -p "$(cat common-scenarios.md)"
claude --plugin-dir <path-to-session-discipline> -p "$(cat edge-scenarios.md)"
```

Compare Claude's predicted invocations to expected. If a mismatch is systemic (not a one-off quirk), the fix lives in the SKILL's **YAML frontmatter `description` field** — that's what Claude's invocation logic reads. The SKILL body is for execution-time guidance, not triggering.

Expected invocations as of v0.1.1:

## common-scenarios.md expected

1. orchestrate — "What's next on this project?"
2. handoff-doc — "Stopping for the day, park this"
3. changelog-discipline — "Update the changelog"
4. backlog — "Add to the backlog"
5. rollback-release — "Deploy broke production, revert"
6. ab-audition — "Which of these two landing pages looks better?"
7. investigation-branch — "Stuck on OAuth, set up proper investigation"
8. NONE — "What time is it in Tokyo?"
9. NONE — "Fix the typo on line 42"
10. investigation-branch — "CI failing 3 days, 4 theories"
11. NONE — "Ship this PR" (ambiguous; not every PR merge is a release)
12. NONE — "Button padding feels wrong" (borderline; ab-audition sometimes triggers, defensible)
13. backlog — "Close FEAT-12, we shipped it"
14. rollback-release — "I already did git revert, anything else?"
15. changelog-discipline — "CHANGELOG jumped v1.2 → v1.5, backfill"
16. NONE — "Run the tests"
17. ab-audition — "Blue CTA vs green, I'm torn"
18. orchestrate — "Orchestrate a plan to ship by Friday"
19. handoff-doc — "Write up where we got to"
20. NONE — "Make the code cleaner" (→ superpowers:simplify)

## edge-scenarios.md expected

1. NONE — "This code sucks, rewrite it" (→ brainstorming)
2. NONE — "I think it's faster but not sure, what do you think?" (performance opinion, not perceptual A/B)
3. changelog-discipline — "Ship v2.1.0 with these changes"
4. NONE or ab-audition — "Button padding feels wrong" (borderline)
5. NONE — "Why does my test fail?" (→ superpowers:systematic-debugging)
6. NONE — "Postgres or MongoDB?" (architecture choice, NOT ab-audition)
7. rollback-release THEN investigation-branch — "Revert, then figure out why"
8. NONE — "Let's pair-program" (→ brainstorming)
9. changelog-discipline + backlog — "CHANGELOG missing entry and BACKLOG is a mess"
10. orchestrate — "What should I do today?"
11. Defensible either way — "Investigate this memory leak" (borderline)
12. changelog-discipline + backlog — "Ship, update CHANGELOG, note in BACKLOG"
13. NONE — "Is this feature done?" (→ superpowers:verification-before-completion)
14. NONE or changelog-discipline — "Merged the PR, all good" (status update)
15. rollback-release — "Deploy failed 30min ago, we're down" (restore first!)
16. ab-audition — "Three button styles, pick one"
17. NONE — "Please commit my work" (trivial)
18. orchestrate or handoff-doc — "Halfway through TS migration, where were we?"
19. NONE — "Tests pass but code looks bad" (→ simplify)
20. investigation-branch — "Race condition in WebSocket, prod only, 3 fixes failed"

## When to re-run

- After editing any SKILL's YAML frontmatter
- Before bumping plugin version
- When considering adding a new skill (run to confirm it doesn't overlap with existing)
