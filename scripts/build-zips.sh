#!/usr/bin/env bash
# Build one zip per plugin for uploading via claude.ai plugin UI.
#
# Outputs: dist/<plugin-name>.zip
# Excludes: .git, .DS_Store, __MACOSX metadata.
# Preserves: executable bits on hook scripts (via zip -X on macOS).
#
# Auto-discovers plugins by finding directories containing
# .claude-plugin/plugin.json at the repo root.
#
# Usage:
#   ./scripts/build-zips.sh              # build all plugins
#   ./scripts/build-zips.sh studio    # build one plugin

set -euo pipefail

# Resolve repo root from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

DIST="$REPO_ROOT/dist"
mkdir -p "$DIST"

# Discover plugins (or use arg)
if [ $# -gt 0 ]; then
    plugins=("$@")
else
    plugins=()
    for dir in */; do
        name="${dir%/}"
        [ -f "$name/.claude-plugin/plugin.json" ] && plugins+=("$name")
    done
fi

if [ ${#plugins[@]} -eq 0 ]; then
    echo "No plugins found (no directories with .claude-plugin/plugin.json)"
    exit 1
fi

echo "Building zips for ${#plugins[@]} plugin(s)..."

for plugin in "${plugins[@]}"; do
    if [ ! -f "$plugin/.claude-plugin/plugin.json" ]; then
        echo "  SKIP: $plugin has no .claude-plugin/plugin.json" >&2
        continue
    fi

    version="$(jq -r .version "$plugin/.claude-plugin/plugin.json" 2>/dev/null || echo "unknown")"
    name="$(jq -r .name "$plugin/.claude-plugin/plugin.json" 2>/dev/null || echo "$plugin")"

    out="$DIST/$plugin.zip"
    rm -f "$out"

    # -X strips macOS extra attributes; -q reduces noise
    zip -r -X -q "$out" "$plugin" \
        -x "$plugin/.git/*" \
        -x "*.DS_Store" \
        -x "__MACOSX/*" \
        -x "$plugin/dist/*" \
        -x "$plugin/node_modules/*"

    size_kb="$(du -k "$out" | cut -f1)"
    echo "  ✓ $name v$version → dist/$plugin.zip (${size_kb} KB)"
done

echo ""
echo "Upload via claude.ai → Settings → Plugins → Upload local plugin."
echo "Each zip contains the plugin directory at archive root."
