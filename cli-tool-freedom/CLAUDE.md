# cli-tool-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to CLI tool development**: command spec design (`CLI-SPEC.md`), language selection (Go/Rust/Python/Node), framework wiring (cobra/clap/typer/commander), subcommand and flag implementation, shell completions, and multi-channel release distribution (Homebrew, npm, crates.io, scoop).

## Do NOT bleed CLI concepts into non-CLI work

When this repo is open and the user is working on a **non-CLI task** (audio plugin, Figma plugin, web app, hardware product, marketing copy, project management), do **not** introduce CLI-domain terminology, analogies, or framings. Specifically:

- No "subcommand-style …" or "flag-namespacing …" analogies in non-CLI contexts
- No POSIX exit-code / stdin-stdout-piping framings unless the user is building a CLI
- No cobra/clap/typer command-tree analogies as metaphors for non-CLI architecture

If the user is invoking this plugin's skills (`/cli-tool-freedom:*`) or naturally asking about CLI tools, the above does **not** apply — you are working in the CLI domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `audio-plugin-freedom` — JUCE audio plugins (DSP, processBlock, APVTS)
- `figma-plugin-freedom` — Figma plugins (TypeScript, postMessage bridge)
- `webapp-freedom` — full-stack web apps
- `hardware-product-freedom` — physical products (CAD, electronics, manufacturing)
- `marketing-team-freedom` — marketing campaigns / copy
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
