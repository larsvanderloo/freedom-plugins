#!/usr/bin/env bash
# Build a plugin zip and publish a GitHub Release with it attached.
#
# Runs entirely on your local machine — no CI / GitHub Actions involved.
# Requires the `gh` CLI (https://cli.github.com) authenticated to the repo's
# remote. Public-repo Releases are free; nothing is charged.
#
# Usage:
#   ./scripts/release-plugin.sh <plugin-name> [--draft] [--prerelease]
#
# Example:
#   ./scripts/release-plugin.sh studio
#
# What it does:
#   1. Reads <plugin>/.claude-plugin/plugin.json for the version
#   2. Verifies the matching git tag <plugin>-v<version> exists locally + on origin
#   3. Runs ./scripts/build-zips.sh <plugin> to produce dist/<plugin>.zip
#   4. Reads the top entry of <plugin>/CHANGELOG.md to populate release notes
#   5. Creates the GitHub Release via gh release create, attaching the zip
#
# Pre-flight:
#   - You must have already committed + pushed the version bump
#   - You must have already created + pushed the tag (git tag <plugin>-vX.Y.Z; git push origin <tag>)
#
# This script does NOT create commits or tags — it only publishes a release
# for an existing tag. Tag and commit discipline lives elsewhere.

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <plugin-name> [--draft] [--prerelease]" >&2
    exit 1
fi

PLUGIN="$1"
shift

EXTRA_FLAGS=()
for arg in "$@"; do
    case "$arg" in
        --draft|--prerelease) EXTRA_FLAGS+=("$arg") ;;
        *) echo "Unknown flag: $arg" >&2; exit 1 ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

PLUGIN_JSON="$PLUGIN/.claude-plugin/plugin.json"
if [ ! -f "$PLUGIN_JSON" ]; then
    echo "ERROR: $PLUGIN_JSON not found" >&2
    exit 1
fi

VERSION="$(jq -r .version "$PLUGIN_JSON")"
TAG="${PLUGIN}-v${VERSION}"

# 1. Verify tag exists locally
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "ERROR: tag $TAG does not exist locally." >&2
    echo "       Create it first: git tag $TAG && git push origin $TAG" >&2
    exit 1
fi

# 2. Verify tag is on origin
if ! git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG"; then
    echo "ERROR: tag $TAG not pushed to origin yet." >&2
    echo "       Run: git push origin $TAG" >&2
    exit 1
fi

# 3. Build the zip
echo "→ Building zip for $PLUGIN..."
"$SCRIPT_DIR/build-zips.sh" "$PLUGIN"
ZIP="$REPO_ROOT/dist/$PLUGIN.zip"
if [ ! -f "$ZIP" ]; then
    echo "ERROR: build did not produce $ZIP" >&2
    exit 1
fi

# 4. Extract the top CHANGELOG entry for release notes
CHANGELOG="$PLUGIN/CHANGELOG.md"
NOTES_FILE=""
if [ -f "$CHANGELOG" ]; then
    NOTES_FILE="$(mktemp)"
    # Grab from first "## " heading until the next "## " heading (exclusive)
    awk '/^## /{i++} i==1' "$CHANGELOG" > "$NOTES_FILE"
    # Strip trailing blank lines
    sed -i '' -e :a -e '/^$/{$d;N;ba' -e '}' "$NOTES_FILE" 2>/dev/null || true
fi

# 5. Check if release already exists
if gh release view "$TAG" >/dev/null 2>&1; then
    echo "Release $TAG already exists. Uploading $ZIP to it..."
    gh release upload "$TAG" "$ZIP" --clobber
    echo "✓ Updated release $TAG with new zip."
else
    echo "→ Creating GitHub Release $TAG..."
    if [ -n "$NOTES_FILE" ]; then
        gh release create "$TAG" "$ZIP" \
            --title "$PLUGIN v$VERSION" \
            --notes-file "$NOTES_FILE" \
            ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"}
    else
        gh release create "$TAG" "$ZIP" \
            --title "$PLUGIN v$VERSION" \
            --generate-notes \
            ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"}
    fi
fi

[ -n "$NOTES_FILE" ] && rm -f "$NOTES_FILE"

URL="$(gh release view "$TAG" --json url -q .url)"
echo ""
echo "✓ Released: $URL"
