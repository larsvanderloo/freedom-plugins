# claude-plugins

Monorepo containing my Claude Code plugins. Each top-level directory is a self-contained plugin — installable independently via `--plugin-dir` or uploadable as a zip via the claude.ai plugin UI.

## Plugins

| Directory | Version | Description |
|---|---|---|
| [`session-discipline/`](./session-discipline) | v0.1.1 | Project-management discipline for long-running Claude Code sessions. Advisory orchestration, handoff docs, CHANGELOG continuity, rollback-as-release, user-judged A/B. Domain-agnostic. |
| [`marketing-team-freedom/`](./marketing-team-freedom) | v0.1.0 | Virtual marketing team — strategist, copywriter, hook-writer, brand-voice guardian, channel-adapter, orchestrator. Treats marketing as a structured Markdown-based pipeline. |

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

## Design specs (not yet built)

See [`DESIGN-SPECS.md`](./DESIGN-SPECS.md) for planned plugins:
- `figma-plugin-freedom` — agents/skills for Figma plugin development
- `webapp-freedom` — full-stack web app lifecycle (stack-agnostic)
- `cli-tool-freedom` — language-agnostic CLI shipping

Each is a ~2-hour scaffold when triggered by a real project.

## Composition

`session-discipline` is the **overlay** — it layers on top of any other plugin in this repo for session-level discipline (orchestration, handoffs, CHANGELOGs, rollbacks). The other plugins are domain-specific and can run standalone or in combination with session-discipline.

```
session-discipline            ← overlay (works with anything)
    │
    ├── marketing-team-freedom     ← content production overlay-consumer
    ├── (figma-plugin-freedom)     ← code production overlay-consumer
    ├── (webapp-freedom)           ← code production overlay-consumer
    └── (cli-tool-freedom)         ← code production overlay-consumer
```

Run any subset you need in a session.

## License

Each plugin ships MIT (see per-plugin `LICENSE`).

## Credits

Extracted from real project work (primarily the `ods-engine` audio-DSP arc + various marketing campaigns). The patterns in each plugin are the "encoded habits" version of working routines that proved valuable across those projects.
