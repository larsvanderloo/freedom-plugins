---
description: Add a flag to an existing CLI command — long-form + short-form, type (bool/string/int/enum/path), default, env-var override, validation, help text. Updates CLI-SPEC.md, the handler, and regenerates shell completions. Use when adding a new option to an existing command. Smaller scope than /command — use that skill for whole new subcommands.
---

# Flag

Adding a flag sounds trivial; done carelessly it ships inconsistency (short-form collision, unclear semantics, missing env-var override, forgotten completion). This skill enforces the pattern.

## Pre-flight

1. Target command exists in CLI-SPEC.md
2. Tool builds + tests pass

## Flow

### Step 1 — Describe the flag

- **Long name:** `--<name>` (lowercase, dash-separated)
- **Short name (optional):** `-<x>` — verify no collision with existing flags on this command or any global flag
- **Type:** bool / string / int / enum / path / list
- **Default value** (if not required)
- **Env var override (optional):** `<TOOL>_<FLAG>` — namespace-prefixed
- **Required?** if yes, error on absence
- **Validation:** format / range / enum values
- **Help text:** one line; example if non-obvious

### Step 2 — Update CLI-SPEC.md

Add the flag to the command's spec with the full description.

### Step 3 — Update the handler

- Register the flag with the CLI framework (cobra/clap/typer/etc.)
- Add validation at handler entry — fail with exit 2 + stderr message on bad input
- Wire env var override per the framework's convention (viper reads env for cobra, clap has `env_var()`, typer has `envvar=`, etc.)
- Use the flag value in the handler logic

### Step 4 — Update tests

- Add a test case for the new flag's happy path
- Add a test case for validation failure
- Confirm the flag is visible in `<tool> <command> --help`

### Step 5 — Regenerate completions

Shell completions often hard-code flag lists. Regenerate so tab-completion picks up the new flag.

### Step 6 — Verify

```bash
<tool> <command> --help | grep -- --<new-flag>   # flag appears
<tool> <command> --<new-flag>=<value>            # works
<tool> <command>                                  # works (default)
<TOOL>_<FLAG>=<value> <tool> <command>            # env override works
```

## Flag naming conventions

- Lowercase, dash-separated: `--max-items`, not `--maxItems` or `--max_items`
- Booleans: `--force` (not `--force=true`); negate with `--no-force` if needed
- Pairs for opposing semantics: `--with-X` and `--without-X`, or single `--X / --no-X`
- Avoid single-word ambiguity: `--dir` (which dir?); prefer `--output-dir`
- Reuse global flag names — don't invent `--verbose-level` when `--verbose` repeatable exists

## Short-form discipline

Reserve short forms carefully:
- `-h` → `--help` (universal)
- `-v` → often `--verbose` OR `--version` (pick one tool-wide, don't mix)
- `-V` → commonly `--version` if `-v` is taken for verbose
- `-q` → `--quiet`
- `-f` → `--force` or `--file` (pick one)
- `-o` → `--output`

For command-specific flags, think twice before assigning a short form. Short forms are a scarce resource.

## Env var override pattern

```
--max-items        flag
MYTOOL_MAX_ITEMS  env var (same name, uppercased, tool prefix)
```

Document in both CLI-SPEC.md and the `--help` output.

## Anti-patterns

- ❌ Flag whose default value differs between `--help` docs and actual code
- ❌ Short-form collision (e.g., `-f` assigned to both `--force` and `--file` in the same command)
- ❌ Silent acceptance of conflicting flags (`--json --text` — error or last-wins, documented)
- ❌ Env var with a different name than the flag (magic)
- ❌ Required flag without error on absence (silently uses some default)
- ❌ Help text that's just the flag name repeated ("--max-items: max items")
