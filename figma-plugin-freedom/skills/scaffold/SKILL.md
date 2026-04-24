---
description: Scaffold a new Figma plugin project from scratch — TypeScript config, manifest.json, code.ts (main thread entry), ui.html (iframe entry), bundler setup (esbuild or vite), and package.json scripts for build + watch + link-to-Figma. Produces a runnable plugin skeleton in ~30 seconds. Use when starting a new Figma plugin from a blank directory, or adding Figma plugin scaffolding to an existing TypeScript project.
---

# Scaffold

Creates the standard Figma plugin file layout in a new or existing directory.

## What gets created

```
<project>/
├── manifest.json          # starts minimal; editorType=["figma"], no permissions
├── code.ts                # main-thread entry with selection handler stub
├── ui.html                # inline JS + styles, Inter 11px, light/dark adaptive
├── package.json           # build/watch scripts via esbuild
├── tsconfig.json          # strict TS, Figma Plugin API types via @figma/plugin-typings
├── .gitignore             # node_modules, code.js, dist
└── README.md              # dev-install instructions (link from Figma Desktop)
```

## Process

1. **Ask the user:** plugin name, one-liner description, and intended editorType(s).
2. **Generate** an `id` placeholder — they'll need to replace it with Figma's generated ID after dev-loading.
3. **Install** `@figma/plugin-typings` via pnpm/npm/yarn (detect from the parent project or prompt).
4. **Write** all scaffold files.
5. **Print** the Figma dev-install instructions:
   ```
   Open Figma Desktop → Plugins → Development → Import plugin from manifest
   → select this manifest.json → Figma generates a real id, copy it back into manifest.json
   ```

## Generated manifest

```json
{
  "name": "<plugin name>",
  "id": "GENERATED-BY-FIGMA-DESKTOP-ON-FIRST-IMPORT",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": { "allowedDomains": ["none"] }
}
```

Minimal-privilege by default. `manifest-specialist` adds permissions later as features need them.

## Generated code.ts

Includes:
- `figma.showUI(__html__, { width: 320, height: 480 })` at entry
- Stub `figma.ui.onmessage` switch
- `figma.on('selectionchange', ...)` wired to push current selection to UI
- One example command (`'ping'` → UI pings, main responds `'pong'`)

## Generated ui.html

Includes:
- Inter 11px base, light/dark CSS via `prefers-color-scheme`
- `window.onmessage` dispatcher matching code.ts
- Ping button that demonstrates round-trip postMessage
- Placeholder for selection display

## Next steps after scaffold

1. Dev-import in Figma Desktop (instructions printed by this skill)
2. Copy generated plugin ID back into manifest.json
3. Use `/figma-plugin-freedom:add-command` to add the first real feature
4. Use `figma-api-research` agent when researching any capability

## Anti-patterns

- ❌ Scaffolding on top of an existing plugin without checking for collisions
- ❌ Generating with overly broad `networkAccess` or `permissions`
- ❌ Skipping the TypeScript types install — `@figma/plugin-typings` makes the whole project type-safe
