// Structured project-state model — what every tool reads from.
// Built on demand from filesystem + git inspection; cached briefly.

import { promises as fs } from "node:fs";
import { join, basename, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";

const exec = promisify(execFile);

export interface Artefact {
  path: string;            // absolute or project-relative
  category: ArtefactCategory;
  domain: Domain | "shared";
  modified: string;        // ISO 8601
}

export type ArtefactCategory =
  | "research"
  | "concept"
  | "spec"
  | "implementation"
  | "review"
  | "release"
  | "handoff"
  | "backlog"
  | "changelog"
  | "decision"
  | "test"
  | "config";

export type Domain =
  | "audio"
  | "marketing"
  | "figma"
  | "webapp"
  | "cli"
  | "hardware"
  | "general";

export interface GitState {
  branch: string;
  ahead: number;
  behind: number;
  recentCommits: { sha: string; subject: string }[];
  recentTags: string[];
  uncommittedFiles: string[];
}

export interface HandoffDoc {
  path: string;
  topic: string;
  status: string;
  modified: string;
}

export interface BacklogItem {
  id: string;              // FEAT-N or similar
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "BLOCKED" | "CLOSED";
  closedInVersion?: string;
}

export interface ProjectModel {
  rootPath: string;
  artefacts: Artefact[];
  gitState: GitState | null;
  handoffs: HandoffDoc[];
  backlogItems: BacklogItem[];
  changelogTopVersion: string | null;
  detectedDomains: Domain[];
}

// ---------- Build the model ----------

export async function buildProjectModel(rootPath: string): Promise<ProjectModel> {
  const [artefacts, gitState, handoffs, backlogItems, changelogTopVersion, detectedDomains] =
    await Promise.all([
      scanArtefacts(rootPath),
      readGitState(rootPath),
      scanHandoffs(rootPath),
      scanBacklog(rootPath),
      readChangelogTop(rootPath),
      detectDomains(rootPath),
    ]);

  return {
    rootPath,
    artefacts,
    gitState,
    handoffs,
    backlogItems,
    changelogTopVersion,
    detectedDomains,
  };
}

// ---------- Artefact scanning ----------

const ARTEFACT_PATTERNS: Array<{
  pattern: RegExp;
  category: ArtefactCategory;
  domain: Domain | "shared";
}> = [
  // Research / spec artefacts
  { pattern: /^RESEARCH-BRIEF\.md$/, category: "research", domain: "shared" },
  { pattern: /^ERGONOMICS\.md$/, category: "research", domain: "hardware" },
  { pattern: /^COMPETITIVE-TEARDOWN\.md$/, category: "research", domain: "hardware" },
  { pattern: /^DESIGN-REFERENCES\.md$/, category: "research", domain: "hardware" },
  { pattern: /^POSITIONING\.md$/, category: "research", domain: "marketing" },
  { pattern: /^AUDIENCE\.md$/, category: "research", domain: "marketing" },
  { pattern: /^BRAND-VOICE\.md$/, category: "research", domain: "marketing" },
  { pattern: /^MESSAGING-HIERARCHY\.md$/, category: "research", domain: "marketing" },
  { pattern: /^PRODUCT-BRIEF\.md$/, category: "research", domain: "webapp" },
  { pattern: /^STACK\.md$/, category: "spec", domain: "webapp" },
  { pattern: /^SCHEMA\.md$/, category: "spec", domain: "webapp" },
  { pattern: /^API\.md$/, category: "spec", domain: "webapp" },
  { pattern: /^CLI-SPEC\.md$/, category: "spec", domain: "cli" },
  { pattern: /^LANGUAGE\.md$/, category: "spec", domain: "cli" },
  { pattern: /^HARDWARE-BRIEF\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^CAD-SPEC.*\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^MATERIALS\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^DFM-REVIEW\.md$/, category: "review", domain: "hardware" },
  { pattern: /^TOLERANCE-STACK\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^ELECTRONICS-ARCH\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^SCHEMATIC-SPEC\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^PCB-LAYOUT-SPEC\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^BOM\.(md|csv)$/, category: "spec", domain: "hardware" },
  { pattern: /^COMPLIANCE-ROADMAP\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^MANUFACTURING-PLAN\.md$/, category: "spec", domain: "hardware" },
  { pattern: /^CONTENT-CALENDAR\.md$/, category: "spec", domain: "marketing" },
  { pattern: /^architecture\.md$/, category: "spec", domain: "audio" },
  { pattern: /^plan\.md$/, category: "spec", domain: "audio" },
  { pattern: /^dsp-research\.md$/, category: "research", domain: "audio" },
  // Cross-cutting
  { pattern: /^CHANGELOG\.md$/, category: "changelog", domain: "shared" },
  { pattern: /^BACKLOG\.md$/, category: "backlog", domain: "shared" },
  { pattern: /^HANDOFF.*\.md$/, category: "handoff", domain: "shared" },
];

async function scanArtefacts(rootPath: string): Promise<Artefact[]> {
  const out: Artefact[] = [];
  const entries = await fs.readdir(rootPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    for (const { pattern, category, domain } of ARTEFACT_PATTERNS) {
      if (pattern.test(name)) {
        const path = join(rootPath, name);
        let modified = "";
        try {
          const st = await fs.stat(path);
          modified = st.mtime.toISOString();
        } catch {}
        out.push({ path, category, domain, modified });
        break;
      }
    }
  }
  // Also scan campaigns/ subdir for marketing
  const campaignsDir = join(rootPath, "campaigns");
  if (existsSync(campaignsDir)) {
    const subdirs = await fs.readdir(campaignsDir, { withFileTypes: true }).catch(() => []);
    for (const sub of subdirs) {
      if (!sub.isDirectory()) continue;
      const briefPath = join(campaignsDir, sub.name, "brief.md");
      if (existsSync(briefPath)) {
        const st = await fs.stat(briefPath);
        out.push({ path: briefPath, category: "spec", domain: "marketing", modified: st.mtime.toISOString() });
      }
    }
  }
  // concepts/ subdir for hardware
  const conceptsDir = join(rootPath, "concepts");
  if (existsSync(conceptsDir)) {
    const files = await fs.readdir(conceptsDir).catch(() => []);
    for (const f of files) {
      if (f.endsWith(".md")) {
        const path = join(conceptsDir, f);
        const st = await fs.stat(path);
        out.push({ path, category: "concept", domain: "hardware", modified: st.mtime.toISOString() });
      }
    }
  }
  return out;
}

// ---------- Git state ----------

async function readGitState(rootPath: string): Promise<GitState | null> {
  try {
    const { stdout: branch } = await exec("git", ["-C", rootPath, "branch", "--show-current"]);
    const { stdout: log } = await exec("git", ["-C", rootPath, "log", "--oneline", "-10"]);
    const { stdout: tags } = await exec("git", ["-C", rootPath, "tag", "--sort=-v:refname"]).catch(() => ({ stdout: "" }));
    const { stdout: status } = await exec("git", ["-C", rootPath, "status", "--porcelain"]).catch(() => ({ stdout: "" }));

    let ahead = 0, behind = 0;
    try {
      const { stdout } = await exec("git", ["-C", rootPath, "rev-list", "--left-right", "--count", "@{u}...HEAD"]);
      const parts = stdout.trim().split(/\s+/);
      behind = Number(parts[0] ?? 0);
      ahead = Number(parts[1] ?? 0);
    } catch {}

    return {
      branch: branch.trim(),
      ahead,
      behind,
      recentCommits: log.split("\n").filter(Boolean).map(l => {
        const [sha, ...rest] = l.split(" ");
        return { sha, subject: rest.join(" ") };
      }),
      recentTags: tags.split("\n").filter(Boolean).slice(0, 10),
      uncommittedFiles: status.split("\n").filter(Boolean).map(l => l.slice(3)),
    };
  } catch {
    return null;
  }
}

// ---------- Handoffs ----------

async function scanHandoffs(rootPath: string): Promise<HandoffDoc[]> {
  const out: HandoffDoc[] = [];
  const entries = await fs.readdir(rootPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.startsWith("HANDOFF") || !entry.name.endsWith(".md")) continue;
    const path = join(rootPath, entry.name);
    try {
      const content = await fs.readFile(path, "utf8");
      const topicLine = content.split("\n").find(l => l.startsWith("# "));
      const topic = topicLine ? topicLine.slice(2).trim() : entry.name;
      const statusMatch = content.match(/\*\*Status:\*\*\s*([^\n]+)/i);
      const status = statusMatch ? statusMatch[1].trim() : "unknown";
      const st = await fs.stat(path);
      out.push({ path, topic, status, modified: st.mtime.toISOString() });
    } catch {}
  }
  return out;
}

// ---------- Backlog ----------

async function scanBacklog(rootPath: string): Promise<BacklogItem[]> {
  const out: BacklogItem[] = [];
  const path = join(rootPath, "BACKLOG.md");
  if (!existsSync(path)) return out;
  try {
    const content = await fs.readFile(path, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      // Match "## FEAT-N: <title>" optionally with "— CLOSED in v..." or " — IN PROGRESS"
      const m = line.match(/^##\s+(FEAT-\d+):\s+(.+?)(?:\s+—\s+(CLOSED in v[\d.]+|IN PROGRESS|BLOCKED|DEFERRED).*)?$/);
      if (m) {
        const [, id, title, marker] = m;
        let status: BacklogItem["status"] = "OPEN";
        let closedInVersion: string | undefined;
        if (marker?.startsWith("CLOSED")) {
          status = "CLOSED";
          const v = marker.match(/CLOSED in (v[\d.]+)/);
          closedInVersion = v?.[1];
        } else if (marker?.includes("IN PROGRESS")) {
          status = "IN_PROGRESS";
        } else if (marker?.includes("BLOCKED")) {
          status = "BLOCKED";
        }
        out.push({ id, title: title.trim(), status, closedInVersion });
      }
    }
  } catch {}
  return out;
}

// ---------- Changelog ----------

async function readChangelogTop(rootPath: string): Promise<string | null> {
  const path = join(rootPath, "CHANGELOG.md");
  if (!existsSync(path)) return null;
  try {
    const content = await fs.readFile(path, "utf8");
    const m = content.match(/^##\s+\[([\d.]+(?:-\w+)?)\]/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// ---------- Domain detection ----------

async function detectDomains(rootPath: string): Promise<Domain[]> {
  const found = new Set<Domain>();
  const fileExists = (p: string) => existsSync(join(rootPath, p));
  const anyMatch = async (patterns: string[]): Promise<boolean> => {
    for (const p of patterns) {
      if (fileExists(p)) return true;
    }
    return false;
  };

  // Audio: JUCE / .cpp / DSP research / CMake referencing JUCE
  let audioDetected =
    fileExists("Source/PluginProcessor.cpp") ||
    fileExists("PluginProcessor.cpp") ||
    fileExists("dsp-research.md") ||
    fileExists("architecture.md") ||
    fileExists("DSP_FREEZE.md") ||
    fileExists("juce_audio_processors") ||
    (await fs.readdir(rootPath).catch(() => [])).some(f => f.endsWith(".jucer"));
  if (!audioDetected && fileExists("CMakeLists.txt")) {
    try {
      const cmake = await fs.readFile(join(rootPath, "CMakeLists.txt"), "utf8");
      if (/juce_add_plugin|JUCE|FetchContent.*[Jj]uce/i.test(cmake)) {
        audioDetected = true;
      }
    } catch {}
  }
  if (audioDetected) found.add("audio");

  // Figma: manifest.json + code.ts/code.js
  if (fileExists("manifest.json") && (fileExists("code.ts") || fileExists("code.js") || fileExists("ui.html"))) {
    found.add("figma");
  }

  // Webapp: package.json with React/Next/Vue/Svelte/Solid
  if (fileExists("package.json")) {
    try {
      const pkg = JSON.parse(await fs.readFile(join(rootPath, "package.json"), "utf8"));
      const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      const webDeps = ["react", "next", "vue", "svelte", "@sveltejs/kit", "solid-js", "vite", "fastify", "hono", "express"];
      if (webDeps.some(d => d in deps) && !found.has("figma")) {
        found.add("webapp");
      }
    } catch {}
  }

  // CLI: Cargo.toml (Rust) / pyproject.toml (Python) / package.json with bin
  if (fileExists("Cargo.toml") || fileExists("pyproject.toml") || fileExists("CLI-SPEC.md") || fileExists("LANGUAGE.md")) {
    found.add("cli");
  }
  // Go: go.mod with main.go OR cmd/
  if (fileExists("go.mod") && (fileExists("main.go") || fileExists("cmd"))) {
    found.add("cli");
  }

  // Hardware: hardware-specific artefacts
  if (
    fileExists("HARDWARE-BRIEF.md") ||
    fileExists("ELECTRONICS-ARCH.md") ||
    fileExists("BOM.csv") ||
    fileExists("BOM.md") ||
    fileExists("CAD-SPEC.md") ||
    (await fs.readdir(rootPath).catch(() => [])).some(f => f.startsWith("CAD-SPEC-"))
  ) {
    found.add("hardware");
  }

  // Marketing: brand voice + audience artefacts
  if (fileExists("POSITIONING.md") || fileExists("AUDIENCE.md") || fileExists("BRAND-VOICE.md")) {
    found.add("marketing");
  }

  if (found.size === 0) found.add("general");
  return Array.from(found);
}
