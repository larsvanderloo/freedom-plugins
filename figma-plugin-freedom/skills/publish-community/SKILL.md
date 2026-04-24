---
description: Pre-submission audit + asset generation for publishing a plugin to figma.com/community. Checks manifest for over-permissioning, validates reasoning strings, produces cover-image + demo-GIF briefs for the user to record, writes the Community listing copy (name, one-liner, description, tags), generates a QA completion checklist, and outputs the final submission package. Use immediately before hitting "Publish" on the Community submission form.
---

# Publish to Community

Getting a plugin past Figma Community review means passing a human reviewer who's seen 10,000 bad submissions. This skill's job is to catch the review-triggering issues before you submit.

## The audit

```markdown
# Pre-submission audit — <plugin name> v<version>

## Manifest review
- [x] `id` is the Figma-generated ID for this specific plugin (not a placeholder)
- [x] `name` matches the Community listing
- [x] `editorType` matches advertised feature set
- [x] `networkAccess.allowedDomains` uses explicit URLs (not `"*"`)
- [x] `networkAccess.reasoning` is user-readable and specific
- [x] Every entry in `permissions` has a corresponding code path that uses it
- [x] No `enablePrivatePluginApi: true`
- [x] `api` version matches current Figma Plugin API

## Code hygiene
- [ ] No `console.log` / `console.error` in the release build
- [ ] No debugging strings visible to users ("TODO", "fixme", internal URLs)
- [ ] No dead code (unused files, unreachable branches, unused permissions)
- [ ] Build output is minified but readable (sourcemaps optional but nice)

## User experience
- [ ] Plugin has an explicit empty-state for "no selection" / "nothing to do"
- [ ] Plugin has an error state with a helpful message (not "Something went wrong")
- [ ] Plugin shows progress for operations > 1 second
- [ ] Plugin closes with a `figma.closePlugin('<message>')` toast
- [ ] Plugin matches Figma's visual conventions (Inter 11px, brand blue, 320px std)

## Figma Community listing (you'll paste into submission form)

### Name
`<plugin name>` (max 50 chars)

### One-liner
`<tagline>` (max 80 chars, appears in search results)

### Description
```
<long form, 2-4 paragraphs>

Use cases:
- <use case>
- <use case>

Supported editors: Figma <+ FigJam + Dev Mode, etc>
```

### Tags (max 3)
- Primary tag (e.g., "Design Systems")
- Secondary tag (e.g., "Components")
- Tertiary tag (e.g., "Productivity")

### Icon (requirement)
- 128×128px PNG
- Transparent or solid background
- Not a screenshot
- Not the Figma logo with overlay (Community rejects)

### Cover image (requirement)
- 1920×960px PNG or JPG
- Shows the plugin actually running
- Either: (a) Figma canvas with the plugin UI visible, (b) a before/after, or (c) a cleaner mockup framing the value prop
- No pricing / "FREE" stickers — community doesn't allow

### Demo GIF / video (strongly recommended)
- 10-20 seconds
- Shows the plugin being opened and completing its main action
- No audio needed
- Record via QuickTime or a dedicated tool, export as GIF < 10MB
- Captures what the cover image can't (motion, the loop of opening → doing → seeing the result)

## Rejection-triggering issues (caught by this audit)

1. Over-permissioned manifest (e.g., `"*"` for network access without justification)
2. `reasoning` strings that say "required for plugin functionality" (too vague)
3. Plugin name contains "Figma" or "AI" generically (reserved / rejected)
4. Cover image is a stock-photo mockup that doesn't show the plugin
5. Description that's marketing copy rather than what the plugin does
6. Plugin uses deprecated APIs (`figma.currentPage.name` patterns that became lazy-loaded)
7. Tags that don't match the plugin's actual purpose

## After audit passes

1. Run `figma-plugin-freedom:test-locally` for the manual QA checklist
2. Record the demo GIF
3. Export the cover image
4. Build the production bundle (`npm run build`)
5. In Figma Desktop: Plugins → Manage plugins → <your plugin> → Publish
6. Paste the listing copy from this audit
7. Upload icon + cover + GIF
8. Submit

Figma review typically takes 2-7 days. If rejected, you'll get specific feedback — usually one of the issues listed above.

## Post-publish

- Add a CHANGELOG entry marking the public version
- Tag the git commit with the published version
- Update your plugin repo's README to link to the Community listing
