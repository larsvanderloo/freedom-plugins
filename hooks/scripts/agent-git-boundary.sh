#!/usr/bin/env bash
# session-discipline plugin — SubagentStart hook
#
# Injects the "forbidden git ops" guardrail into every subagent dispatch.
# The orchestrator is the sole owner of commits, tags, branch moves, pushes.
# Subagents can READ git state (log, diff, status) but never mutate.
#
# Hook input on stdin is JSON with at least:
#   { "subagent_type": "<type>", "prompt": "<original prompt>" }
#
# Hook output is JSON:
#   { "hookSpecificOutput": { "hookEventName": "SubagentStart",
#     "additionalContext": "<guardrail text>" } }

set -euo pipefail

# Read stdin (informational only — we always inject the same guardrail)
input="$(cat || true)"

# Extract subagent_type for status reporting (best-effort)
subagent_type="$(echo "$input" | jq -r '.subagent_type // "unknown"' 2>/dev/null || echo "unknown")"

cat <<'JSON'
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "\n\n---\n\n## Forbidden git operations (session-discipline guardrail)\n\nYou must NOT run any of these:\n- `git commit` (including `--amend`)\n- `git tag`\n- `git push` (including `--force`)\n- `git reset --hard`\n- `git stash pop` on a branch you didn't stash on\n- `git checkout <other-branch>` (you may check OUT files, not branches)\n- `git merge`\n- `git rebase`\n- `git revert`\n- any variant of the above, via aliases or scripts\n\nThe orchestrator is the sole owner of git history mutations. If you need a commit or tag made, describe in your response:\n1. What files to stage\n2. The exact commit message\n3. Any tag to create\n...and STOP. The orchestrator will handle it.\n\nYou MAY use read-only git: `git log`, `git diff`, `git status`, `git show`, `git blame`, `git branch --show-current`, `git tag --list`.\n\n---\n"
  }
}
JSON
