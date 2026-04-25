// Search across project artefacts (HANDOFF, CHANGELOG, BACKLOG, decision logs,
// research / spec docs) for a free-text query. Returns hits with path + line +
// 3-line context.

import { promises as fs } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface SearchHit {
  path: string;
  lineNumber: number;
  matchedLine: string;
  context: string[];   // 1 line before + matched line + 1 line after
}

const SEARCH_FILE_PATTERNS = [
  /^CHANGELOG\.md$/,
  /^BACKLOG\.md$/,
  /^HANDOFF.*\.md$/,
  /^README\.md$/,
  /^RESEARCH-BRIEF\.md$/,
  /^POSITIONING\.md$/,
  /^AUDIENCE\.md$/,
  /^BRAND-VOICE\.md$/,
  /^MESSAGING-HIERARCHY\.md$/,
  /^PRODUCT-BRIEF\.md$/,
  /^STACK\.md$/,
  /^SCHEMA\.md$/,
  /^API\.md$/,
  /^CLI-SPEC\.md$/,
  /^LANGUAGE\.md$/,
  /^HARDWARE-BRIEF\.md$/,
  /^CAD-SPEC.*\.md$/,
  /^MATERIALS\.md$/,
  /^DFM-REVIEW\.md$/,
  /^TOLERANCE-STACK\.md$/,
  /^ELECTRONICS-ARCH\.md$/,
  /^SCHEMATIC-SPEC\.md$/,
  /^PCB-LAYOUT-SPEC\.md$/,
  /^BOM\.md$/,
  /^COMPLIANCE-ROADMAP\.md$/,
  /^MANUFACTURING-PLAN\.md$/,
  /^ERGONOMICS\.md$/,
  /^COMPETITIVE-TEARDOWN\.md$/,
  /^DESIGN-REFERENCES\.md$/,
  /^architecture\.md$/,
  /^plan\.md$/,
  /^dsp-research\.md$/,
];

const SEARCH_SUBDIRS = ["research", "concepts", "campaigns", "post-mortems", "docs"];

export async function crossPluginSearch(
  rootPath: string,
  query: string,
  options: { caseSensitive?: boolean; maxHits?: number } = {},
): Promise<SearchHit[]> {
  const { caseSensitive = false, maxHits = 50 } = options;
  const results: SearchHit[] = [];

  // Find all candidate files
  const candidates: string[] = [];

  // Top-level matched files
  const topEntries = await fs.readdir(rootPath, { withFileTypes: true }).catch(() => []);
  for (const entry of topEntries) {
    if (entry.isFile()) {
      for (const pat of SEARCH_FILE_PATTERNS) {
        if (pat.test(entry.name)) {
          candidates.push(join(rootPath, entry.name));
          break;
        }
      }
    }
  }

  // Subdirs (recursive .md files only)
  for (const sub of SEARCH_SUBDIRS) {
    const dir = join(rootPath, sub);
    if (existsSync(dir)) {
      await collectMdRecursive(dir, candidates);
    }
  }

  // Search each file
  const queryRegex = new RegExp(escapeRegExp(query), caseSensitive ? "" : "i");

  for (const path of candidates) {
    try {
      const content = await fs.readFile(path, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (queryRegex.test(line)) {
          if (results.length >= maxHits) return;
          const context = [
            lines[idx - 1] ?? "",
            line,
            lines[idx + 1] ?? "",
          ];
          results.push({
            path,
            lineNumber: idx + 1,
            matchedLine: line,
            context,
          });
        }
      });
    } catch {}
  }

  return results.slice(0, maxHits);
}

async function collectMdRecursive(dir: string, out: string[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules / dist / .git etc
      if (["node_modules", "dist", ".git", ".claude", ".claude-state"].includes(entry.name)) continue;
      await collectMdRecursive(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
