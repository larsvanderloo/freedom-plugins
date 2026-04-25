// JUCE / audio-plugin-specific project model.
// Scans the project root for source files, planning artefacts, build configuration,
// and infers the current pipeline phase (Stage 0 research → Stage 3 GUI → shipping).

import { promises as fs } from "node:fs";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

export type Stage =
  | "stage-0-research"
  | "stage-1-shell"
  | "stage-2-dsp"
  | "stage-3-gui"
  | "shipping"
  | "unknown";

export interface SourceFile {
  path: string;            // absolute
  relPath: string;         // relative to project root
  bytes: number;
  lastModifiedISO: string;
}

export interface AudioProjectModel {
  rootPath: string;
  hasArchitectureMd: boolean;
  hasPlanMd: boolean;
  hasDspResearchMd: boolean;
  hasDspFreezeMd: boolean;
  hasCMakeLists: boolean;
  juceModulesDeclared: string[];   // from CMakeLists, e.g. ["juce_audio_processors", "juce_dsp"]
  hasJuceFetchContent: boolean;
  pluginProcessorCpp: SourceFile | null;
  pluginEditorCpp: SourceFile | null;
  webviewIndexHtml: string | null; // path if found
  cppFiles: SourceFile[];
  hppFiles: SourceFile[];
  detectedStage: Stage;
  versionTagsCount: number;        // rough proxy for "shipped" — counted from .git/refs/tags
}

const SOURCE_DIR_CANDIDATES = ["Source", "src", "source"];

export async function buildAudioProjectModel(rootPath: string): Promise<AudioProjectModel> {
  const hasArchitectureMd = existsSync(join(rootPath, "architecture.md"));
  const hasPlanMd = existsSync(join(rootPath, "plan.md"));
  const hasDspResearchMd = existsSync(join(rootPath, "dsp-research.md"));
  const hasDspFreezeMd = existsSync(join(rootPath, "DSP_FREEZE.md"));
  const hasCMakeLists = existsSync(join(rootPath, "CMakeLists.txt"));

  let juceModulesDeclared: string[] = [];
  let hasJuceFetchContent = false;
  if (hasCMakeLists) {
    try {
      const cmake = await fs.readFile(join(rootPath, "CMakeLists.txt"), "utf8");
      hasJuceFetchContent = /FetchContent.*[Jj]uce|juce_add_plugin|find_package\(JUCE/i.test(cmake);
      const moduleMatches = cmake.matchAll(/\bjuce_[a-z_]+\b/g);
      const modules = new Set<string>();
      for (const m of moduleMatches) modules.add(m[0]);
      juceModulesDeclared = Array.from(modules).sort();
    } catch {}
  }

  const cppFiles: SourceFile[] = [];
  const hppFiles: SourceFile[] = [];
  let pluginProcessorCpp: SourceFile | null = null;
  let pluginEditorCpp: SourceFile | null = null;
  let webviewIndexHtml: string | null = null;

  const seenAbs = new Set<string>();
  for (const dir of SOURCE_DIR_CANDIDATES) {
    const sourceDir = join(rootPath, dir);
    if (!existsSync(sourceDir)) continue;
    await collectSourceFiles(sourceDir, rootPath, cppFiles, hppFiles, false, seenAbs);
  }
  // Also scan project root (some JUCE projects keep .cpp at root)
  await collectSourceFiles(rootPath, rootPath, cppFiles, hppFiles, /* shallow */ true, seenAbs);

  for (const f of cppFiles) {
    if (f.relPath.endsWith("PluginProcessor.cpp")) pluginProcessorCpp = f;
    if (f.relPath.endsWith("PluginEditor.cpp")) pluginEditorCpp = f;
  }

  // Common WebView UI paths
  const webviewCandidates = ["Source/WebView/index.html", "WebView/index.html", "ui/index.html", "WebUI/index.html"];
  for (const c of webviewCandidates) {
    if (existsSync(join(rootPath, c))) {
      webviewIndexHtml = c;
      break;
    }
  }

  // Version-tag count via .git/refs/tags (rough; ignores annotated-only tags pushed without local refs)
  let versionTagsCount = 0;
  const tagsDir = join(rootPath, ".git", "refs", "tags");
  if (existsSync(tagsDir)) {
    try {
      const entries = await fs.readdir(tagsDir);
      versionTagsCount = entries.filter(e => /v\d+\.\d+\.\d+/.test(e)).length;
    } catch {}
  }

  const detectedStage = inferStage({
    hasArchitectureMd,
    hasPlanMd,
    hasDspResearchMd,
    hasDspFreezeMd,
    hasCMakeLists,
    pluginProcessorCpp,
    pluginEditorCpp,
    webviewIndexHtml,
    versionTagsCount,
  });

  return {
    rootPath,
    hasArchitectureMd,
    hasPlanMd,
    hasDspResearchMd,
    hasDspFreezeMd,
    hasCMakeLists,
    juceModulesDeclared,
    hasJuceFetchContent,
    pluginProcessorCpp,
    pluginEditorCpp,
    webviewIndexHtml,
    cppFiles,
    hppFiles,
    detectedStage,
    versionTagsCount,
  };
}

async function collectSourceFiles(
  dir: string,
  rootPath: string,
  cpp: SourceFile[],
  hpp: SourceFile[],
  shallow: boolean,
  seenAbs: Set<string>,
): Promise<void> {
  // Resolve via realpath to deduplicate case-variant directories on
  // case-insensitive filesystems (macOS default APFS) and symlinks.
  let realDir = dir;
  try {
    realDir = await fs.realpath(dir);
  } catch {
    /* ignore */
  }
  if (seenAbs.has(realDir)) return;
  seenAbs.add(realDir);

  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shallow) continue;
      if (entry.name === "node_modules" || entry.name === "build" || entry.name.startsWith(".")) continue;
      if (entry.name === "JUCE" || entry.name === "juce") continue;
      await collectSourceFiles(path, rootPath, cpp, hpp, false, seenAbs);
      continue;
    }
    if (!entry.isFile()) continue;
    const lower = entry.name.toLowerCase();
    if (!(lower.endsWith(".cpp") || lower.endsWith(".h") || lower.endsWith(".hpp"))) continue;
    let realFile = path;
    try {
      realFile = await fs.realpath(path);
    } catch {
      /* ignore */
    }
    if (seenAbs.has(realFile)) continue;
    seenAbs.add(realFile);
    try {
      const stat = await fs.stat(path);
      const sf: SourceFile = {
        path,
        relPath: relative(rootPath, path),
        bytes: stat.size,
        lastModifiedISO: stat.mtime.toISOString(),
      };
      if (lower.endsWith(".cpp")) cpp.push(sf);
      else hpp.push(sf);
    } catch {}
  }
}

function inferStage(state: {
  hasArchitectureMd: boolean;
  hasPlanMd: boolean;
  hasDspResearchMd: boolean;
  hasDspFreezeMd: boolean;
  hasCMakeLists: boolean;
  pluginProcessorCpp: SourceFile | null;
  pluginEditorCpp: SourceFile | null;
  webviewIndexHtml: string | null;
  versionTagsCount: number;
}): Stage {
  // Shipping signal: ≥2 version tags + frozen DSP + GUI present.
  if (state.versionTagsCount >= 2 && state.hasDspFreezeMd && state.webviewIndexHtml) {
    return "shipping";
  }
  // Stage 3 GUI: WebView present + processor present.
  if (state.webviewIndexHtml && state.pluginProcessorCpp) {
    return "stage-3-gui";
  }
  // Stage 2 DSP: processor source present + plan committed.
  if (state.pluginProcessorCpp && state.hasPlanMd) {
    return "stage-2-dsp";
  }
  // Stage 1 shell: CMake + processor stub but no real DSP frozen.
  if (state.hasCMakeLists && state.pluginProcessorCpp) {
    return "stage-1-shell";
  }
  // Stage 0 research: any of the upstream planning docs.
  if (state.hasArchitectureMd || state.hasPlanMd || state.hasDspResearchMd) {
    return "stage-0-research";
  }
  return "unknown";
}
