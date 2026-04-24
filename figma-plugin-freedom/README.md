# figma-plugin-freedom

Claude Code plugin for building Figma plugins. Four specialised agents + five skills that cover scaffolding, API research, manifest management, runtime implementation, UI iframe, local QA, and Community submission.

TypeScript-first. Designed to layer on top of [`session-discipline`](../session-discipline) for the session overlay (handoff docs, CHANGELOG, rollback-as-release).

## Install

```bash
claude --plugin-dir ~/Documents/Claude/claude-plugins/figma-plugin-freedom
# Or combined with session-discipline:
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/session-discipline \
  --plugin-dir ~/Documents/Claude/claude-plugins/figma-plugin-freedom
```

## Quick start — new plugin

```
/figma-plugin-freedom:scaffold
```

Answer the prompts (name, description, editorType). The skill produces a runnable TypeScript plugin skeleton — manifest, main thread, UI, bundler, tsconfig. Print the Figma Desktop dev-import instructions.

## Agents

| Agent | Role |
|---|---|
| `figma-api-research` | Knows what the Plugin API can/can't do. Produces research notes + code sketches before implementation. |
| `manifest-specialist` | Owns `manifest.json`. Minimum-privilege, Community-submission-audit-ready. |
| `plugin-runtime` | Writes main-thread `code.ts` — node manipulation, selection, async ops, postMessage bridge server side. |
| `iframe-ui` | Writes the plugin's iframe UI — matches Figma visual conventions, dark mode, loading/error states. |

## Skills (`/figma-plugin-freedom:<name>`)

| Skill | What it does |
|---|---|
| `scaffold` | Create new plugin project (manifest + code.ts + ui.html + build config) |
| `add-command` | Wire a new command end-to-end (manifest menu + handler + UI trigger + types) |
| `postmessage` | Generate typed main↔UI message contract + helpers |
| `test-locally` | Generate plugin-specific manual QA checklist |
| `publish-community` | Pre-submission audit + listing copy + asset briefs |

## Typical feature flow

```
1. figma-api-research     → "Can the plugin do X? What's the API path?"
2. manifest-specialist    → add any required permissions (minimum privilege)
3. /add-command           → wire the new command end-to-end
   ├── plugin-runtime     → writes the main-thread handler
   └── iframe-ui          → writes the UI trigger
4. /test-locally          → run manual QA checklist
5. /publish-community     → pre-submission audit (when ready to ship to Community)
```

## Why not just "vibe code" Figma plugins?

Figma plugins have specific constraints most LLMs don't track:
- Permissions must be declared ahead of time; "just ask for more" gets rejected by Community review
- Main thread and UI thread communicate only via structured-clonable postMessage
- Async operations (font loading, variable collections) must be awaited before sync property sets
- Each editor type (Figma / FigJam / Dev Mode) has different API surface

These agents internalise those constraints so drafts don't ship broken.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md) for the full plugin collection.
