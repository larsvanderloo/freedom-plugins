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

    # If plugin ships an MCP server (mcp/package.json), ensure it's bundled fresh
    if [ -f "$plugin/mcp/package.json" ]; then
        if [ ! -d "$plugin/mcp/node_modules" ]; then
            echo "  → installing $plugin/mcp deps..."
            (cd "$plugin/mcp" && npm install --silent)
        fi
        if jq -e '.scripts.bundle' "$plugin/mcp/package.json" > /dev/null 2>&1; then
            echo "  → bundling $plugin MCP server..."
            (cd "$plugin/mcp" && npm run bundle --silent) || {
                echo "  ✗ bundle failed for $plugin" >&2
                continue
            }
            chmod +x "$plugin/mcp/dist/index.js" 2>/dev/null || true
        fi
    fi

    out="$DIST/$plugin.zip"
    rm -f "$out"

    # -X strips macOS extra attributes; -q reduces noise
    # Note: $plugin/dist and $plugin/node_modules excluded at top-level only,
    # so $plugin/mcp/dist (the MCP bundle) IS included.
    zip -r -X -q "$out" "$plugin" \
        -x "$plugin/.git/*" \
        -x "*.DS_Store" \
        -x "__MACOSX/*" \
        -x "$plugin/dist/*" \
        -x "$plugin/node_modules/*" \
        -x "$plugin/mcp/node_modules/*" \
        -x "$plugin/mcp/src/*" \
        -x "$plugin/mcp/tsconfig.json"

    size_kb="$(du -k "$out" | cut -f1)"
    echo "  ✓ $name v$version → dist/$plugin.zip (${size_kb} KB)"
done

echo ""
echo "Upload via claude.ai → Settings → Plugins → Upload local plugin."
echo "Each zip contains the plugin directory at archive root."
