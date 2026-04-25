# claude-plugins

Monorepo containing my Claude Code plugins. Each top-level directory is a self-contained plugin — installable independently via `--plugin-dir` or uploadable as a zip via the claude.ai plugin UI.

## Plugins

| Directory | Version | Description |
|---|---|---|
| [`session-discipline/`](./session-discipline) | v0.1.1 | Project-management discipline for long-running sessions. Advisory orchestration, handoff docs, CHANGELOG continuity, rollback-as-release, user-judged A/B. Domain-agnostic. **Overlay — recommended alongside any other plugin.** |
| [`marketing-team-freedom/`](./marketing-team-freedom) | v0.1.0 | Virtual marketing team — strategist, copywriter, hook-writer, brand-voice guardian, channel-adapter, orchestrator. Structured Markdown-based content pipeline. |
| [`figma-plugin-freedom/`](./figma-plugin-freedom) | v0.1.0 | Figma plugin development — API research, manifest specialist, plugin runtime, iframe UI. TypeScript scaffolding through Community submission. |
| [`webapp-freedom/`](./webapp-freedom) | v0.1.0 | Full-stack web app — product research, data model, API design, end-to-end impl. Stack-agnostic (React/Vue/Svelte × Node/Python/Go × Postgres). |
| [`cli-tool-freedom/`](./cli-tool-freedom) | v0.1.0 | CLI tool shipping — spec-first design, language-agnostic impl (Go/Rust/Python/Node), shell completions, multi-channel release. |
| [`audio-plugin-freedom/`](./audio-plugin-freedom) | v0.1.0 | JUCE audio plugin development — 14 agents covering Stage 0 (DSP research) through release. **Battle-tested** on the ods-engine Dumble #124 project across 20+ tagged releases. |
| [`industrial-design-team/`](./industrial-design-team) | v0.1.0 | Hardware product / industrial design — research, concept, parametric CAD spec, DFM review, materials selection, tolerance-stack analysis. Specifications-not-geometry. |

## Installing one plugin

```bash
# Clone or symlink a single plugin directory:
claude --plugin-dir ./session-discipline

# Multiple plugins in one session:
claude --plugin-dir ./session-discipline --plugin-dir ./marketing-team-freedom
```

## Uploading as zip (claude.ai plugin UI)

```bash
./scripts/build-zips.sh
# → produces dist/<plugin-name>.zip for each plugin
# → upload via claude.ai → Settings → Plugins → Upload local plugin
```

## Repo conventions

### Per-plugin tags

Tags are prefixed with the plugin name so multiple plugins can coexist in one repo:

```
session-discipline-v0.1.0
session-discipline-v0.1.1
marketing-team-freedom-v0.1.0
...
```

Tag message: one-line summary that matches the plugin's CHANGELOG headline for that version.

### Per-plugin CHANGELOGs

Each plugin has its own `CHANGELOG.md` inside its directory. Do NOT maintain a root-level CHANGELOG — it conflates plugin histories and rots.

### Per-plugin versions

Each plugin's `.claude-plugin/plugin.json` carries its own `version` field, bumped independently. Plugins don't version-lock to each other.

### Shipping a new plugin version

1. Edit files inside the plugin's directory
2. Bump `<plugin>/.claude-plugin/plugin.json` `version`
3. Add an entry at the top of `<plugin>/CHANGELOG.md`
4. Commit with a message like `<plugin> v0.1.2: <headline>`
5. Tag: `git tag -a <plugin>-v0.1.2 -m "<headline>"`
6. Re-run `./scripts/build-zips.sh` to refresh `dist/` zips

### Adding a new plugin

1. Create a new top-level directory `<new-plugin>/`
2. Add `.claude-plugin/plugin.json`, `skills/`, `agents/`, `hooks/`, `README.md`, `CHANGELOG.md`, `LICENSE`
3. Update this README's Plugins table
4. Update `scripts/build-zips.sh` to include the new plugin
5. Commit + tag: `<new-plugin>-v0.1.0`

## Design specs

See [`DESIGN-SPECS.md`](./DESIGN-SPECS.md) for the original design notes of the now-shipped plugins (figma / webapp / cli) — preserved for reference + as a template for future plugins. When you design a new plugin, follow the same three-questions recipe at the bottom of that file.

## Composition

`session-discipline` is the **overlay** — it layers on top of any other plugin in this repo for session-level discipline (orchestration, handoffs, CHANGELOGs, rollbacks). The other plugins are domain-specific and can run standalone or in combination with session-discipline.

```
session-discipline            ← overlay (works with anything)
    │
    ├── marketing-team-freedom     ← content production (Markdown deliverables)
    ├── figma-plugin-freedom       ← Figma plugin dev (TypeScript)
    ├── webapp-freedom             ← full-stack web apps (stack-agnostic)
    ├── cli-tool-freedom           ← CLI tools (language-agnostic)
    ├── audio-plugin-freedom       ← JUCE audio plugins (battle-tested)
    └── industrial-design-team     ← hardware / industrial design (specs not CAD)
```

Run any subset you need in a session.

## License

Each plugin ships MIT (see per-plugin `LICENSE`).

## Credits

Extracted from real project work (primarily the `ods-engine` audio-DSP arc + various marketing campaigns). The patterns in each plugin are the "encoded habits" version of working routines that proved valuable across those projects.
