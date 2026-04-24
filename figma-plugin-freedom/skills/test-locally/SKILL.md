---
description: Generate a Figma-specific manual QA checklist for the current plugin — selection edge cases (empty, single, multi, mixed types, 1000+ nodes), undo stack behaviour, dark/light mode, window resize, file permissions (read-only file, viewer-role user), editor types (FigJam vs Figma vs Dev Mode). Prints a ticked-off checklist the user can walk through before shipping. Use before submitting to Community or before a major release.
---

# Test Locally

Figma plugins have a bunch of edge cases that don't show up in unit tests — only in the real application. This skill prints a structured manual-QA checklist.

## The checklist

```markdown
# Manual QA — <plugin name> v<version>

## Selection edge cases
- [ ] Empty selection: plugin UI shows empty-state copy
- [ ] Single node: plugin works
- [ ] Multi-select (3-5 nodes): plugin works on all of them
- [ ] Large multi-select (100+ nodes): plugin shows progress, doesn't hang
- [ ] Mixed-type selection (frame + text + vector): plugin either works on all or gracefully refuses
- [ ] Nested selection (child inside parent both selected): plugin handles deduplication

## Document state
- [ ] Empty document: plugin doesn't crash
- [ ] Very large document (10K+ nodes): plugin's `findAll` calls don't freeze Figma
- [ ] Document with hidden layers: plugin respects / ignores `visible === false` as designed
- [ ] Document with locked layers: plugin refuses to modify locked layers (or surfaces a clear error)
- [ ] Document with component instances (including from external libraries)

## Undo stack
- [ ] Plugin action is one undo entry (not 50 micro-undos)
- [ ] Cmd+Z after plugin run reverts the action
- [ ] Cmd+Shift+Z redoes the action correctly
- [ ] No orphan nodes left behind after undo (no "ghost" nodes)

## UI
- [ ] Light mode: text readable, colours correct
- [ ] Dark mode: text readable, colours correct (use Figma → Settings → Dark Mode to test)
- [ ] UI resize: if plugin is resizable, content reflows
- [ ] UI initial size matches `figma.showUI({ width, height })`
- [ ] Keyboard-only navigation: tab-to-button works, Enter triggers the primary action

## postMessage bridge
- [ ] UI → main: messages arrive correctly typed
- [ ] Main → UI: messages arrive correctly typed
- [ ] Errors surface to UI (not silent failures)
- [ ] Long-running ops show progress, not frozen UI
- [ ] Cancel button actually cancels

## Editor types
- [ ] Figma design editor: works (if advertised)
- [ ] FigJam: works (if advertised) OR refuses gracefully (if not)
- [ ] Dev Mode: works (if advertised)
- [ ] Slides: works (if advertised)

## File permissions
- [ ] Read-only file (viewer role): plugin refuses write attempts with clear message
- [ ] Library file (component set owner): plugin respects publish state
- [ ] Drafts vs team files: plugin works in both (no hidden team-library assumption)

## Network (if applicable)
- [ ] Offline: plugin handles fetch failures without crashing
- [ ] Slow network: plugin times out gracefully after N seconds
- [ ] API auth expired (401): plugin prompts re-auth or shows actionable error

## Close behaviour
- [ ] Plugin closes cleanly on Cmd+W
- [ ] Plugin persists important state to `figma.clientStorage` before close
- [ ] No dangling listeners (subsequent plugin run doesn't have stale state)

## Cross-file / cross-platform
- [ ] Works on macOS Figma Desktop
- [ ] Works in Figma Web (Chrome, Safari, Firefox)
- [ ] Works on Windows Figma Desktop
- [ ] (Rare) Works on Linux Figma Web

## Pre-submission (Community)
- [ ] Plugin name + description accurate
- [ ] Cover image + GIF demo recorded
- [ ] Manifest permissions are minimum-privilege
- [ ] No `console.log` in release build
- [ ] No Figma test-file leaked in build artefacts
```

## Usage

Invoke the skill to generate this checklist for the current plugin. Optionally, the skill can:
- Read the plugin's manifest + source and **customise** the list (e.g., skip the "Dev Mode" items if `editorType` doesn't include `"dev"`)
- Save the checklist as `QA-<version>.md` in the plugin repo for audit trail
- Append "Tester: <name> / Date: <date>" for sign-off

## Recommended cadence

- Run the checklist before every Community submission
- Run selection/document-state/undo items before any release (they're the highest-risk categories)
- Save completed checklists in `qa/` for future reference
