---
description: Ship a new version of the CLI — version bump, CHANGELOG entry, build matrix across platforms, checksums, GitHub release, and distribution-channel pushes (brew tap, npm, crates.io, scoop, etc.) per LANGUAGE.md. Runs a pre-release audit first (no debug prints, tests pass, CLI-SPEC.md in sync). Use when ready to publish a new version. Dispatches cli-distribution for the actual channel pushes.
---

# Release

End-to-end release flow for a CLI tool. Audit → build → package → publish.

## Pre-release audit

- [ ] CLI-SPEC.md matches current implementation (every command/flag documented)
- [ ] `<tool> --help` output is clean (no TODO / placeholder text)
- [ ] `<tool> --version` exists and returns non-empty
- [ ] All tests pass on all target platforms (CI matrix green)
- [ ] No debug logs (`println!`, `fmt.Println`, etc.) in release build
- [ ] CHANGELOG entry for this version is written + committed
- [ ] No `--flag` in help that isn't actually wired
- [ ] Shell completions regenerated (`/cli-tool-freedom:completions`)
- [ ] README Install section still accurate

## Flow

### Step 1 — Version bump

Decide semver increment:
- **Patch (x.y.Z)**: bug fixes, docs, internal changes
- **Minor (x.Y.0)**: new commands / flags, backwards-compatible
- **Major (X.0.0)**: breaking changes (renamed flags, removed commands, changed output shape)

Update the version in all the right places:
- Go: `internal/version/version.go` const + goreleaser tag
- Rust: `Cargo.toml`
- Python: `pyproject.toml`
- Node: `package.json`

Verify `<tool> --version` prints the new version after rebuild.

### Step 2 — Write CHANGELOG

Use `/studio:changelog-discipline` if that plugin is installed. Otherwise, add a top-of-file entry:

```markdown
## [<x.y.z>] — <YYYY-MM-DD>

### Added
- <new command / feature>

### Changed
- <existing behaviour change — mark breaking if breaking>

### Fixed
- <bug>

### Removed
- <removed feature — breaking>

### Install
See README.
```

### Step 3 — Commit + tag

```bash
git add -A
git commit -m "release: v<x.y.z>"
git tag -a v<x.y.z> -m "v<x.y.z> — <headline>"
git push origin main --tags
```

If `studio`'s `version-bump-sync` hook is installed, it'll verify the tag + version match.

### Step 4 — Dispatch `cli-distribution`

Invoke with:
- Version number
- Target channels from LANGUAGE.md
- Release notes (CHANGELOG excerpt for this version)

Produces:
- Per-platform binaries (darwin-arm64, darwin-amd64, linux-amd64, linux-arm64, windows-amd64)
- Archives (.tar.gz for unix, .zip for windows)
- checksums.txt
- GitHub release with all assets
- Updates to brew tap / npm / crates.io / scoop manifest / etc.

### Step 5 — Verify installs

```bash
# Test each channel you shipped to:
brew update && brew upgrade <tool> && <tool> --version   # should be x.y.z
npm install -g <tool>@x.y.z && <tool> --version
cargo install <tool> --version x.y.z && <tool> --version
```

Confirm the installed version matches the shipped version.

### Step 6 — Announce

- Update README if install commands changed
- Tweet / post / Discord / mailing list
- Update any "docs.<tool>.dev"-style landing pages

## Breaking-change procedure

If the release includes breaking changes:

1. Document the breaking change FIRST in CHANGELOG under `### Changed (BREAKING)`
2. Provide migration notes: "If you used `--old-flag`, use `--new-flag` instead"
3. Consider a deprecation release first: ship v1.N with both old and new, warn on old usage, remove old in v2.0
4. Never ship breaking in a patch version

## Rollback

If the release ships broken — users report bugs within 30 minutes of release:

- Invoke `/studio:rollback-release`
- That ships v<x.y.z+1> as a rollback: either re-pin all distribution channels to the previous version, OR ship a new patch version that reverts the breaking change
- Don't untag the broken release — keep it for diagnostic A/B work
- File a handoff (`/studio:handoff-doc`) for the post-mortem investigation

## Anti-patterns

- ❌ Shipping a version whose `--version` output doesn't match the git tag
- ❌ Skipping CHANGELOG because "it's just a patch"
- ❌ Breaking changes in a minor or patch version
- ❌ Publishing to one channel and forgetting the others — users get different versions based on where they installed from
- ❌ No rollback plan — "we'll fix forward if anything breaks" has cost many Saturdays
- ❌ Releasing on Friday afternoon
