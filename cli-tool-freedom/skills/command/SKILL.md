---
description: Add a new subcommand to an existing CLI tool end-to-end — spec update in CLI-SPEC.md, handler implementation in the chosen language, argument parsing + validation, output formatter integration (text + JSON), help text with an example, and a test. Use when growing the CLI's command surface. Dispatches cli-design to confirm spec first, then cli-impl for the implementation.
---

# Command

Standard flow for adding a new subcommand. Touches CLI-SPEC.md + one new source file + the root command registration + one test.

## Pre-flight

1. `CLI-SPEC.md` exists — if not, dispatch `cli-design` for the initial spec
2. `LANGUAGE.md` exists — if not, dispatch `/cli-tool-freedom:scaffold` first
3. Tool builds and tests pass before the change

## Flow

### Step 1 — Confirm the shape

Ask the user for:
- Command name (single word, verb preferred)
- One-sentence purpose
- Positional arguments (required, optional, variadic?)
- Flags specific to this command
- Output shape (stdout content per format — text + JSON)
- Error conditions + exit codes
- 2-3 example invocations

### Step 2 — Update `CLI-SPEC.md`

Dispatch `cli-design` to write the new command's spec block, keeping style consistent with existing commands.

### Step 3 — Dispatch `cli-impl`

Produces:
- New source file (e.g. `cmd/<command>.go`, `src/commands/<command>.rs`)
- Command registration in the root
- Handler with proper flag parsing + validation
- Uses the `output` abstraction for text/JSON formatting
- Respects global flags (`--verbose`, `--quiet`, `--no-color`, `--format`)
- Returns proper exit code
- Unit test for the handler logic
- Integration test: invoke the built binary with representative args, assert stdout/stderr/exit

### Step 4 — Update docs

- `README.md` command list
- Generated man page if applicable
- Shell completions need regeneration (`/cli-tool-freedom:completions`)

### Step 5 — Verify

- `<tool> --help` shows the new command
- `<tool> <command> --help` shows flags + examples
- Happy path works: documented example produces documented output
- JSON mode: `<tool> <command> --format json | jq .` parses
- Error path: bad input exits with the documented code + writes to stderr

### Step 6 — Report

```
✓ Command implemented: <tool> <command>
  - Spec: CLI-SPEC.md (new section added)
  - Source: cmd/<command>.<ext>
  - Tests: cmd/<command>_test.<ext> (2 cases)
  - Registered at: cmd/root.<ext>

Next:
  /cli-tool-freedom:completions   — regenerate shell completions
  /cli-tool-freedom:release       — ship a new version including this command
```

## Anti-patterns

- ❌ Adding a command without updating CLI-SPEC.md (spec drift)
- ❌ Using `fmt.Println` / raw stdout writes instead of the output abstraction
- ❌ Copying from a similar command without re-reading the spec
- ❌ Skipping the test
- ❌ Adding a destructive default without confirmation prompt / --force requirement
- ❌ Help text without examples — users copy-paste examples, not synopsis
