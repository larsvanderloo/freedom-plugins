# Design specs — plugins not yet built

Three planned plugins. Each is ~2 hours to scaffold using the pattern established by `session-discipline` + `marketing-team-freedom`. Build when a real project needs one, not speculatively.

## figma-plugin-freedom

**Domain:** Figma plugin development.

**Agents:**
- `figma-api-research` — PluginAPI, selection model, node types, ui-postMessage
- `manifest-specialist` — manifest.json, editorType, networkAccess, permissions
- `plugin-runtime-agent` — main thread — figma.* API calls, node manipulation
- `iframe-ui-agent` — the plugin UI panel (HTML/CSS/JS, postMessage bridge)
- `figma-qa-agent` — manual test protocols in Figma desktop
- `community-release` — figma.com/community submission (cover art, gif, metadata)
- `figma-orchestrator` — top-level coordinator

**Skills (`/figma-plugin-freedom:<name>`):**
- `scaffold` — create a new plugin project (manifest + code.ts + ui.html)
- `add-command` — wire a new plugin menu command end-to-end
- `postmessage` — generate main↔UI bridge stubs with typed payloads
- `test-locally` — print dev-load instructions + checklist
- `qa-checklist` — generates a Figma-specific QA checklist
- `publish-community` — pre-submission audit + cover-art brief

**Hooks:** `PostToolUse` on `Edit` of manifest.json → lint/validate.

**Language:** TypeScript. Depends on `session-discipline` for session overlay.

---

## webapp-freedom

**Domain:** Full-stack web app lifecycle. Stack-agnostic (pluggable: React/Vue/Svelte/Solid frontend; Node/Python/Go backend).

**Agents:**
- `product-research` — user needs, competitive scan, JTBD
- `data-model-agent` — schema design, migrations, relationships
- `api-design-agent` — REST/GraphQL endpoint design, auth flow
- `frontend-agent` — UI (pluggable framework)
- `backend-agent` — API (pluggable stack)
- `e2e-qa-agent` — Playwright / Cypress user flows
- `deploy-agent` — Vercel / Fly / Railway / self-hosted
- `webapp-orchestrator` — top-level coordinator

**Skills (`/webapp-freedom:<name>`):**
- `plan` — architecture + stack selection
- `scaffold` — create project structure for chosen stack
- `data` — design + generate migration
- `endpoint` — add a new API endpoint end-to-end (route, handler, test)
- `page` — add a new frontend route end-to-end (route, component, state)
- `e2e` — write an E2E test for a user flow
- `deploy` — pre-deploy audit + deploy

**Hooks:** `PostToolUse` on `Edit package.json` → pnpm install suggestion.

**Stack-agnostic:** skills prompt for stack on first use, then remember via a `STACK.md` file in the repo.

**Depends on:** `session-discipline`.

---

## cli-tool-freedom

**Domain:** CLI tool shipping. Language-agnostic (Go / Rust / Python / Node).

**Agents:**
- `cli-design-agent` — UX: command structure, flags, help text, exit codes
- `cli-impl-agent` — core implementation (pluggable language)
- `cli-test-agent` — shell-level + unit tests, cross-platform QA
- `cli-distribution-agent` — packaging: brew tap, npm, cargo, scoop, apt

**Skills (`/cli-tool-freedom:<name>`):**
- `scaffold` — init project with chosen language
- `command` — add a new subcommand end-to-end
- `flag` — add a flag with help text + validation
- `completions` — generate shell completions (bash/zsh/fish)
- `release` — tag + package + upload to chosen distribution channels

**Hooks:** `PostToolUse` on `git tag` → generate release artefacts.

**Language-agnostic:** pick at scaffold time.

**Depends on:** `session-discipline`.

---

## Bootstrap recipe for any new domain plugin

When scaffolding a new plugin, answer three questions:

1. **What's the research phase?** (e.g., audio → DSP algorithms; Figma → Plugin API; marketing → positioning)
   → defines the **Stage 0 research agent**

2. **What's the domain-specific QA?** (e.g., audio → null tests / THD; Figma → plugin behavior in desktop; webapp → E2E flows)
   → defines the **Stage 6 QA agent**

3. **What's the domain-specific asset / content?** (e.g., audio → presets; Figma → cover art + gif demo; marketing → positioning doc)
   → defines the **Stage 7 content agent**

The rest (planning, foundation, core impl, UI, validation, CICD, orchestrator, reviewer) follow from the language and platform, and agent descriptions are ~90% transferable across domains.

## When to actually build one

Build a plugin when you have a real project that will immediately consume it. Speculative plugins rot — descriptions don't get iterated, edge cases don't surface, invocation logic doesn't get tuned against real user messages. Wait for an actual Figma plugin / web app / CLI project, then scaffold the plugin as the first step of that project.
