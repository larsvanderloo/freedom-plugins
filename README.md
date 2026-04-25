# freedom-plugins

A coordinated suite of Claude Code plugins for shipping real products: audio plugins, hardware devices, web apps, CLI tools, Figma plugins, and the marketing around them. Plus `studio` — a project-management overlay that composes with everything else.

Every plugin in this repo encodes a working pipeline distilled from real projects, not theory.

## Plugins

| Directory | Version | Description |
|---|---|---|
| [`studio/`](./studio) | v0.3.0 | Project-management overlay. Advisory orchestration, handoff docs, CHANGELOG continuity, rollback-as-release, user-judged A/B, structured investigations. **Now ships an MCP server with 8 project-state tools.** Domain-agnostic. **Overlay — recommended alongside any other plugin.** |
| [`audio-plugin-freedom/`](./audio-plugin-freedom) | v0.1.1 | JUCE audio plugin development — 14 agents covering Stage 0 (DSP research) through release. Battle-tested on the `ods-engine` Dumble #124 project across 20+ tagged releases. |
| [`hardware-product-freedom/`](./hardware-product-freedom) | v0.1.2 | Hardware product — industrial design + electronics + manufacturing in one coordinated team. 11 agents + 10 skills covering enclosure, PCB, BOM, compliance (FCC/CE/RoHS), CM selection, FAI. For non-electronic products, only the ID skills (`concept`, `cad-spec`, `dfm-review`, `materials-spec`, `tolerance-stack`) need to be invoked. |
| [`webapp-freedom/`](./webapp-freedom) | v0.1.1 | Full-stack web app — product research, data model, API design, end-to-end impl. Stack-agnostic (React/Vue/Svelte × Node/Python/Go × Postgres). |
| [`cli-tool-freedom/`](./cli-tool-freedom) | v0.1.1 | CLI tool shipping — spec-first design, language-agnostic impl (Go/Rust/Python/Node), shell completions, multi-channel release. |
| [`figma-plugin-freedom/`](./figma-plugin-freedom) | v0.1.1 | Figma plugin development — API research, manifest specialist, plugin runtime, iframe UI. TypeScript scaffolding through Community submission. |
| [`marketing-team-freedom/`](./marketing-team-freedom) | v0.1.1 | Virtual marketing team — strategist, copywriter, hook-writer, brand-voice guardian, channel-adapter, orchestrator. Structured Markdown content pipeline. |

## Installing one plugin

```bash
# Single plugin via --plugin-dir:
claude --plugin-dir ./studio

# Multiple plugins in one session:
claude --plugin-dir ./studio --plugin-dir ./audio-plugin-freedom
```

## Uploading as zip (claude.ai plugin UI)

```bash
./scripts/build-zips.sh
# → produces dist/<plugin-name>.zip for each plugin
# → upload via claude.ai → Settings → Plugins → Upload local plugin
```

For plugins shipping an MCP server (currently just `studio`), the build script auto-bundles via `npm run bundle` and ships a single `mcp/dist/index.js` inside the zip — end users don't need `npm install`.

## Composition

`studio` is the **overlay** — load it alongside any of the domain plugins.

```
studio            ← overlay (works with anything; reads state, proposes next action)
    │
    ├── audio-plugin-freedom          ← JUCE audio plugins
    ├── hardware-product-freedom      ← hardware (ID + electronics + manufacturing)
    ├── webapp-freedom                ← full-stack web apps
    ├── cli-tool-freedom              ← CLI tools
    ├── figma-plugin-freedom          ← Figma plugin dev
    └── marketing-team-freedom        ← content / campaigns
```

**Examples:**

```bash
# Building a Dumble-style guitar plugin
claude --plugin-dir studio --plugin-dir audio-plugin-freedom

# Hardware pedal version of the same engine
claude --plugin-dir studio \
       --plugin-dir audio-plugin-freedom \
       --plugin-dir hardware-product-freedom

# Plus marketing for the launch
claude --plugin-dir studio \
       --plugin-dir audio-plugin-freedom \
       --plugin-dir hardware-product-freedom \
       --plugin-dir marketing-team-freedom
```

`/studio:orchestrate` reads state across all loaded domains and proposes the next concrete action.

## Repo conventions

### Per-plugin tags

Tags are prefixed with the plugin name so multiple plugins can coexist in one repo:

```
studio-v0.3.0
audio-plugin-freedom-v0.1.1
hardware-product-freedom-v0.1.2
…
```

Tag message: one-line summary matching the plugin's CHANGELOG headline for that version.

### CHANGELOGs (two layers)

- **Per-plugin:** every plugin has `<plugin>/CHANGELOG.md` — that's the canonical history for that plugin.
- **Suite-level:** `CHANGELOG.md` at repo root tracks suite-wide events (renames, new plugins added, cross-plugin refactors). It does **not** duplicate plugin entries.

### BACKLOG (suite-level)

`BACKLOG.md` at repo root tracks **cross-plugin** FEAT-N items (e.g. "add MCP server to all `*-freedom` plugins"). Plugin-specific items belong in `<plugin>/BACKLOG.md` if a plugin grows enough work to warrant one.

### Per-plugin versions

Each plugin's `.claude-plugin/plugin.json` carries its own `version`, bumped independently. Plugins don't version-lock.

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
4. Commit + tag: `<new-plugin>-v0.1.0`
5. (Optional) note the addition in suite-level `CHANGELOG.md`

## Design specs

See [`DESIGN-SPECS.md`](./DESIGN-SPECS.md) for the original design notes of the now-shipped plugins (figma / webapp / cli) — preserved for reference and as a template for future plugins.

## Project management

The repo dogfoods `studio`'s patterns:

- **`README.md`** (this file) — entry point + contribution rules
- **`CHANGELOG.md`** — suite-level event log
- **`BACKLOG.md`** — cross-plugin FEAT items
- **Per-plugin handoffs** when work spans sessions

## License

Each plugin ships MIT (see per-plugin `LICENSE`).

## Credits

Extracted from real project work (primarily the `ods-engine` audio-DSP arc + various marketing campaigns). The patterns in each plugin are the encoded-habits version of working routines that proved valuable across those projects.
