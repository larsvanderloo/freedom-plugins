---
name: cicd
description: Orchestrates the CI/CD Agent for GitHub Actions pipeline management, release automation, and versioning. Generates build/test/release workflows. Invoked by /cicd command.
allowed-tools:
  - Task # REQUIRED - delegates to cicd-agent
  - Read # For build configuration
  - Write # For workflow files
  - Bash # For git operations, version tagging
preconditions:
  - CMakeLists.txt must exist (build system required)
---

# cicd Skill

**Purpose:** Orchestrate the CI/CD Agent for GitHub Actions pipeline generation and release management.

**Invoked by:** `/cicd` command or product-orchestrator dispatch

---

## Entry Point

### Subcommands
```
/cicd setup              # Generate GitHub Actions workflows
/cicd release [version]  # Create release tag and trigger pipeline
/cicd status             # Check current CI/CD status
```

---

## Setup Mode (`/cicd setup`)

1. Read CMakeLists.txt to understand build configuration
2. Invoke cicd-agent to generate:
   - `.github/workflows/build.yml` (build on push/PR)
   - `.github/workflows/test.yml` (tests on PR)
   - `.github/workflows/release.yml` (tag-triggered release)
3. Handle JUCE path for CI (symlink or CMake variable)
4. Commit generated workflows

## Release Mode (`/cicd release [version]`)

1. Verify all tests passing
2. Verify qa-report.md clean (if exists)
3. Bump version in CMakeLists.txt
4. Update CHANGELOG.md
5. Create git tag `v[version]`
6. Push tag to trigger release workflow

## Status Mode (`/cicd status`)

1. Check if workflows exist in `.github/workflows/`
2. Report current version from CMakeLists.txt
3. Report latest git tag
4. Check recent CI run status (if accessible)
