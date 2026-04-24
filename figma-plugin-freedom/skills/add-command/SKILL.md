---
description: Wire a new plugin command end-to-end — menu entry in manifest, handler in code.ts, UI trigger in ui.html, typed postMessage contract between them. Produces all three edits atomically so the new command is clickable immediately. Use when adding any user-initiated action to an existing Figma plugin. Dispatches to plugin-runtime + iframe-ui + manifest-specialist in sequence.
---

# Add Command

The standard "add a new thing the user can do" flow. Touches 3-4 files: `manifest.json`, `code.ts`, `ui.html`, and potentially a shared messages type file.

## What the skill asks

1. **Command name** — short, verb-based (e.g., "Align to Grid", "Extract Tokens", "Generate Summary")
2. **Trigger** — menu item? UI button? Both?
3. **Input** — needs user input in UI? takes selection? parameterised via `figma.parameters`?
4. **Output** — mutates the document? shows a result in UI? exports something?

## Flow

### Step 1 — Dispatch `manifest-specialist`

Add the new command to `manifest.json`'s `menu` array (and `parameters` if the command is parameterised).

### Step 2 — Dispatch `plugin-runtime`

Add a case to the `figma.ui.onmessage` switch in `code.ts`:

```typescript
case 'align-to-grid': {
  const nodes = figma.currentPage.selection;
  if (nodes.length === 0) {
    figma.notify('Select nodes to align.', { error: true });
    return;
  }
  for (const node of nodes) {
    node.x = Math.round(node.x / 8) * 8;
    node.y = Math.round(node.y / 8) * 8;
  }
  figma.ui.postMessage({ type: 'align-done', count: nodes.length });
}
```

### Step 3 — Dispatch `iframe-ui`

Add the UI trigger + handler in `ui.html`:

```html
<button onclick="send('align-to-grid')">Align to 8px grid</button>
```

```javascript
case 'align-done':
  setStatus(`Aligned ${msg.count} nodes.`);
  break;
```

### Step 4 — Update the shared messages type (if used)

```typescript
// shared/messages.ts
export type PluginMessage =
  | { type: 'align-to-grid' }
  | { type: 'align-done'; count: number }
  // ...
```

### Step 5 — Report

Return a summary with the three file paths edited and a one-line "dev-test this by: select 2+ nodes, click the Align button".

## Parameter-driven commands

If the command takes parameters via Figma's command palette (`figma.parameters`):

```typescript
// In code.ts
figma.parameters.on('input', ({ key, query, result }) => {
  if (key === 'mode') {
    result.setSuggestions(['tight', 'loose'].filter(v => v.startsWith(query)));
  }
});

figma.on('run', ({ parameters, command }) => {
  if (command === 'align-to-grid') {
    const mode = parameters?.mode ?? 'tight';
    // ...
    figma.closePlugin(`Aligned in ${mode} mode.`);
  }
});
```

Manifest side:

```json
{
  "menu": [{
    "name": "Align to Grid",
    "command": "align-to-grid",
    "parameters": [
      { "name": "Mode", "key": "mode", "allowFreeform": false }
    ]
  }]
}
```

## Anti-patterns

- ❌ Adding a menu entry in manifest without the code.ts handler (silent failure when clicked)
- ❌ Adding a UI button without updating the manifest's menu (only discoverable through plugin UI, not Figma's command palette)
- ❌ Forgetting the shared message type update — TypeScript loses its grip
- ❌ Command name that doesn't read as a verb ("Tokens" bad; "Extract Tokens" good)
