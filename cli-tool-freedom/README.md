# cli-tool-freedom

Claude Code plugin for shipping command-line tools. Three agents + five skills that cover UX design, cross-language implementation, shell completions, and distribution across brew / npm / cargo / scoop / apt / direct-binary.

Language-agnostic — pick Go / Rust / Python / Node at scaffold time, remembered in `LANGUAGE.md`. Designed to layer on [`session-discipline`](../session-discipline).

## Install

```bash
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/session-discipline \
  --plugin-dir ~/Documents/Claude/claude-plugins/cli-tool-freedom
```

## Quick start

```
/cli-tool-freedom:scaffold
```

Interviews you for name, language, distribution targets, initial commands. Produces runnable project (`<tool> --help` / `<tool> --version` / `<tool> hello World` all work) with release tooling pre-wired.

## Agents

| Agent | Role |
|---|---|
| `cli-design` | Writes `CLI-SPEC.md` — command structure, flags, exit codes, stdout/stderr, output formats. Reads [clig.dev](https://clig.dev/) conventions. |
| `cli-impl` | Writes source code in chosen language. Cobra / clap / typer / commander per `LANGUAGE.md`. Handles output abstraction, config precedence, signal handling. |
| `cli-distribution` | Packages + ships — builds matrix, checksums, GitHub releases, brew tap / npm / crates.io / scoop / apt / direct binaries. |

## Skills (`/cli-tool-freedom:<name>`)

| Skill | What it does |
|---|---|
| `scaffold` | New CLI project — language, framework, release tooling, working sample command |
| `command` | Add a new subcommand end-to-end (spec + handler + test + completions regen) |
| `flag` | Add a flag to an existing command (short-form hygiene, env-var override, validation) |
| `completions` | Generate + install bash / zsh / fish / PowerShell completion scripts |
| `release` | Version bump → CHANGELOG → build matrix → publish to channels |

## Supported languages

| Language | Framework | Distribution |
|---|---|---|
| Go | cobra + viper | goreleaser → brew, scoop, direct |
| Rust | clap v4 + config-rs | cargo → crates.io, brew, direct |
| Python | typer (or click) | pipx, PyPI |
| Node | commander / yargs | npm |

## Philosophy

- **Spec before code.** `CLI-SPEC.md` → `LANGUAGE.md` → implementation. Design deliberately; bad UX costs decades.
- **Follow conventions.** [clig.dev](https://clig.dev), POSIX, GNU long-options. Reinventing flag parsing is a red flag.
- **stdout for data, stderr for logs.** Pipe-safe by default.
- **Machine output is separate from human output.** `--format json` OR default-human. Never try to be both.
- **Exit codes carry information.** 0 success, 1 generic, 2 misuse, 3+ domain-specific + documented.
- **Every channel gets the same version.** Shipping to brew and forgetting npm creates Schrödinger installs.
- **Breaking changes are major versions.** No exceptions.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md).
