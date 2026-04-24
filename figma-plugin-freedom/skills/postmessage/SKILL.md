---
description: Generate typed postMessage bridge stubs between main thread (code.ts) and UI thread (ui.html) for a Figma plugin. Produces the message-type union, the sender helpers, the receiver switches on both sides, and the shared types file. Use when building a new feature that needs round-trip communication, or when a plugin's ad-hoc string-message patterns should be refactored to a typed contract.
---

# PostMessage

Figma plugins communicate across the main/UI boundary via `postMessage`. Ad-hoc usage works but drifts fast. This skill installs a typed contract.

## What it produces

```
shared/messages.ts       # discriminated union of all plugin messages
code.ts                  # receive-helper + send-helper with types
ui.html (or ui.ts)       # receive-helper + send-helper, same types
```

## Shared types file

```typescript
// shared/messages.ts

// Messages UI → main thread
export type UIToMain =
  | { type: 'ping' }
  | { type: 'scan-tokens'; payload: { depth: number } }
  | { type: 'apply-token'; payload: { tokenId: string; nodeId: string } };

// Messages main → UI thread
export type MainToUI =
  | { type: 'pong'; at: number }
  | { type: 'scan-progress'; payload: { done: number; total: number } }
  | { type: 'scan-result'; payload: { tokens: TokenSummary[] } }
  | { type: 'error'; payload: { message: string } };

export interface TokenSummary {
  id: string;
  name: string;
  type: 'color' | 'number' | 'string' | 'boolean';
  value: unknown;
}
```

## Main-thread helpers

```typescript
// code.ts top
import type { UIToMain, MainToUI } from './shared/messages';

function sendToUI(msg: MainToUI) {
  figma.ui.postMessage(msg);
}

figma.ui.onmessage = async (msg: UIToMain) => {
  switch (msg.type) {
    case 'ping':
      sendToUI({ type: 'pong', at: Date.now() });
      break;
    case 'scan-tokens':
      // ...
      break;
    case 'apply-token':
      // ...
      break;
  }
};
```

## UI-thread helpers

```typescript
// ui.ts (or inline in ui.html)
import type { UIToMain, MainToUI } from '../shared/messages';

function sendToMain(msg: UIToMain) {
  parent.postMessage({ pluginMessage: msg }, '*');
}

window.addEventListener('message', (evt) => {
  const msg = evt.data.pluginMessage as MainToUI | undefined;
  if (!msg) return;
  switch (msg.type) {
    case 'pong':
      console.log(`Round-trip: ${Date.now() - msg.at}ms`);
      break;
    case 'scan-progress':
      updateProgress(msg.payload.done, msg.payload.total);
      break;
    case 'scan-result':
      renderTokens(msg.payload.tokens);
      break;
    case 'error':
      showError(msg.payload.message);
      break;
  }
});
```

## Rules the skill enforces

1. **All payloads must be structured-clonable.** No functions, no DOM nodes, no Figma node references. If the main side has a node, send its `.id` and have the UI request details.
2. **Every message type has a handler on the receiving side.** If UI sends `scan-tokens` but code.ts doesn't case-match it, the message is silently dropped. The skill grep-checks before declaring done.
3. **Error is its own message type.** Don't overload a happy-path message with an error field.
4. **Progress messages are separate from result messages.** Long operations send `scan-progress` repeatedly, then one final `scan-result`.

## Migration from ad-hoc

If the plugin currently has `figma.ui.postMessage({ foo: 'bar' })` scattered inline:

1. Grep for all `postMessage` calls on both sides
2. Extract every distinct shape
3. Write `shared/messages.ts` with the full union
4. Refactor each send site to use the typed helpers
5. Replace switch-on-stringly-typed-fields with switch-on-discriminant

Ship the refactor in one commit. Don't half-migrate — mixing typed and untyped messages is worse than either approach alone.

## Anti-patterns

- ❌ Using `any` for the message type
- ❌ Sending `figma.currentPage` / node references across the bridge
- ❌ Different types for "same message" on the two sides — one discriminated union, period
- ❌ Generic `{ type: 'message', data: ... }` envelope — kills the discriminant advantage
