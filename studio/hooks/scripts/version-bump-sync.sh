#!/usr/bin/env bash
# studio plugin — PostToolUse hook on `git tag`
#
# When a new tag is created, verify the version number in common manifest
# files matches the tag. Catches drift like the "engine v0.19.5" label bug
# that triggered v0.20.3 in ods-engine.
#
# Checks:
#   CMakeLists.txt:  project(... VERSION X.Y.Z ...)
#   package.json:    "version": "X.Y.Z"
#   Cargo.toml:      version = "X.Y.Z"
#   pyproject.toml:  version = "X.Y.Z"
#
# Emits a `systemMessage` warning if any found manifest disagrees with the
# tag. Non-blocking — the tag stands, but the user is notified.

set -euo pipefail

input="$(cat || true)"

# Extract the git tag command and attempt to get the tag name
command="$(echo "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)"
# Parse tag name from the command: `git tag -a v1.2.3 -m "..."` or `git tag v1.2.3`
tag_raw="$(echo "$command" | grep -oE 'git tag( -[a-zA-Z]+)* +v?[0-9]+\.[0-9]+\.[0-9]+[^ ]*' | awk '{print $NF}' | head -n1 || true)"
tag="${tag_raw#v}"

if [ -z "$tag" ]; then
    # Couldn't parse — exit quietly.
    exit 0
fi

# Find repo root
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

warnings=()

# CMakeLists.txt
if [ -f "$repo_root/CMakeLists.txt" ]; then
    cmake_ver="$(grep -oE 'project\([^)]*VERSION +[0-9]+\.[0-9]+\.[0-9]+' "$repo_root/CMakeLists.txt" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
    if [ -n "$cmake_ver" ] && [ "$cmake_ver" != "$tag" ]; then
        warnings+=("CMakeLists.txt project version is $cmake_ver but tag is v$tag")
    fi
fi

# package.json
if [ -f "$repo_root/package.json" ]; then
    pkg_ver="$(jq -r '.version // empty' "$repo_root/package.json" 2>/dev/null || true)"
    if [ -n "$pkg_ver" ] && [ "$pkg_ver" != "$tag" ]; then
        warnings+=("package.json version is $pkg_ver but tag is v$tag")
    fi
fi

# Cargo.toml
if [ -f "$repo_root/Cargo.toml" ]; then
    cargo_ver="$(grep -oE '^version *= *"[0-9]+\.[0-9]+\.[0-9]+"' "$repo_root/Cargo.toml" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
    if [ -n "$cargo_ver" ] && [ "$cargo_ver" != "$tag" ]; then
        warnings+=("Cargo.toml version is $cargo_ver but tag is v$tag")
    fi
fi

# pyproject.toml
if [ -f "$repo_root/pyproject.toml" ]; then
    py_ver="$(grep -oE '^version *= *"[0-9]+\.[0-9]+\.[0-9]+"' "$repo_root/pyproject.toml" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
    if [ -n "$py_ver" ] && [ "$py_ver" != "$tag" ]; then
        warnings+=("pyproject.toml version is $py_ver but tag is v$tag")
    fi
fi

if [ ${#warnings[@]} -eq 0 ]; then
    # All manifests match (or none exist). Emit a positive confirmation.
    cat <<JSON
{
  "systemMessage": "studio: tag v$tag matches all found manifest versions ✓"
}
JSON
    exit 0
fi

# Build a compound warning message
msg="⚠ studio VERSION SYNC WARNING (tag v$tag):\n"
for w in "${warnings[@]}"; do
    msg+="  - $w\n"
done
msg+="\nConsider bumping the manifest(s) + committing a fix before shipping."

# JSON-escape the message
escaped="$(echo -e "$msg" | jq -Rs .)"
cat <<JSON
{
  "systemMessage": $escaped
}
JSON
