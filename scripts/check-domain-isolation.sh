#!/usr/bin/env bash
# Verify each `*-freedom` plugin has a CLAUDE.md containing the domain-isolation marker.
#
# Background: see suite BACKLOG.md FEAT-7 — domains bleed across plugins because
# all *-freedom plugins are loaded simultaneously. Each plugin's CLAUDE.md
# documents its scope and warns against importing analogies into other domains.
# This check enforces the convention so a plugin can't ship without it.
#
# Usage:
#   ./scripts/check-domain-isolation.sh              # check all *-freedom plugins
#   ./scripts/check-domain-isolation.sh <plugin>     # check a single plugin
#
# Exit codes:
#   0 — all checked plugins pass
#   1 — one or more plugins missing CLAUDE.md or marker
#
# `studio` is excluded by design — it is domain-agnostic project management.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

MARKER="<!-- domain-isolation-marker:v1 -->"
FAILED=0

check_plugin() {
    local plugin="$1"
    local claude_md="$plugin/CLAUDE.md"

    if [ ! -d "$plugin" ]; then
        echo "ERROR: $plugin/ does not exist" >&2
        return 1
    fi

    if [ ! -f "$claude_md" ]; then
        echo "FAIL: $plugin — missing CLAUDE.md" >&2
        return 1
    fi

    if ! grep -qF "$MARKER" "$claude_md"; then
        echo "FAIL: $plugin/CLAUDE.md — missing marker '$MARKER'" >&2
        return 1
    fi

    echo "OK:   $plugin"
    return 0
}

if [ $# -ge 1 ]; then
    # Single-plugin mode — used by release-plugin.sh as a pre-flight gate.
    PLUGIN="$1"
    if [ "$PLUGIN" = "studio" ]; then
        echo "SKIP: studio is domain-agnostic; no isolation marker required."
        exit 0
    fi
    if [[ "$PLUGIN" != *-freedom ]]; then
        echo "SKIP: $PLUGIN is not a *-freedom plugin; no isolation marker required."
        exit 0
    fi
    check_plugin "$PLUGIN" || FAILED=1
else
    # All-plugins mode — sweep every *-freedom directory.
    shopt -s nullglob
    for plugin_dir in *-freedom/; do
        plugin="${plugin_dir%/}"
        check_plugin "$plugin" || FAILED=1
    done
fi

if [ "$FAILED" -ne 0 ]; then
    echo "" >&2
    echo "Domain-isolation check failed. See suite BACKLOG.md FEAT-7." >&2
    exit 1
fi

echo ""
echo "Domain-isolation check passed."
