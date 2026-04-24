---
description: Scaffold a new CLI tool project. Interviews the user for binary name, language (Go/Rust/Python/Node), and initial command list. Dispatches cli-design for CLI-SPEC.md, then creates the language-specific skeleton with the chosen framework (cobra/clap/typer/commander), global flags plumbed, output abstraction in place, a sample subcommand that round-trips stdin → stdout, and release tooling configured. Produces a runnable, testable, shippable skeleton.
---

# Scaffold

Takes a CLI tool from "blank directory" to "runs + builds + releases" in one invocation.

## Flow

### Step 1 — Interview
- **Binary name**
- **One-liner description**
- **Language:** Go / Rust / Python / Node
- **Intended distribution channels:** (brew, npm, cargo, pipx, curl-sh, etc.)
- **Initial commands:** at least one subcommand the user has in mind

### Step 2 — Dispatch `cli-design`

Produces `CLI-SPEC.md` — user reviews and signs off before scaffold proceeds.

### Step 3 — Write `LANGUAGE.md`

Per-language config:

```markdown
# Language — <tool>
## Choice
- **Language:** <Go/Rust/Python/Node>
- **CLI framework:** <cobra/clap/typer/commander>
- **Config library:** <viper/config-rs/tomllib/cosmiconfig>
- **Distribution targets:** <list>
- **Build:** <goreleaser / cargo / pyinstaller / pkg>
```

### Step 4 — Generate skeleton

Per language, create the standard layout (see `cli-impl` agent for shape).

Every skeleton includes:
- `main` entry
- Root command with global flags (`--help`, `--version`, `--verbose`, `--quiet`, `--format`, `--no-color`)
- Sample subcommand (`<tool> hello [name]`) that echoes a greeting — round-trips stdin if `-` is passed as name
- `output` abstraction: `text` formatter (default) + `json` formatter
- Config loading with precedence: flag > env > config file > default
- Signal handling (SIGINT cleanup, exit 130)
- Logging to stderr
- One unit test + one integration test
- Release tooling (`.goreleaser.yaml` for Go, `release-plz.toml` for Rust, etc.)

### Step 5 — Verify

- Build: `go build` / `cargo build` / etc. — succeeds
- Run: `./<tool> --help` — shows expected output
- Run: `./<tool> --version` — shows correct version
- Run: `echo "World" | ./<tool> hello -` — stdin round-trip works
- Run: `./<tool> hello World --format json` — emits valid JSON
- Run: tests pass

### Step 6 — Report

```
✓ Scaffold complete
→ Build:   <build command>
→ Run:     ./<tool> --help
→ Test:    <test command>
→ Release: <release command>

Next:
  /cli-tool-freedom:command — add a new subcommand end-to-end
  /cli-tool-freedom:flag    — add a flag to an existing command
```

## Anti-patterns

- ❌ Scaffolding before the user picks a language
- ❌ Adopting a framework that the user's team hasn't agreed to
- ❌ Skipping `CLI-SPEC.md` — the skeleton shapes itself around the spec
- ❌ Generating without global flags wired (they're needed from day 1, not added later)
