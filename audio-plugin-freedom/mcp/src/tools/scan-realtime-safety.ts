import { promises as fs } from "node:fs";
import { buildAudioProjectModel } from "../state/audio-project.js";
import { findProcessBlockMethods, scanForUnsafeOps, type SafetyFinding } from "../parsers/cpp-source.js";

export interface ScanRealtimeSafetyResult {
  rootPath: string;
  filesScanned: number;
  processBlockMethodsFound: number;
  findings: ScanFinding[];
  summary: {
    blocker: number;
    major: number;
    minor: number;
  };
}

export interface ScanFinding extends SafetyFinding {
  file: string;            // relative path
  method: string;          // e.g. "processBlock"
}

export async function scanRealtimeSafety(projectPath: string): Promise<ScanRealtimeSafetyResult> {
  const model = await buildAudioProjectModel(projectPath);
  const findings: ScanFinding[] = [];
  let processBlockMethodsFound = 0;

  for (const file of model.cppFiles) {
    let content = "";
    try {
      content = await fs.readFile(file.path, "utf8");
    } catch {
      continue;
    }
    const methods = findProcessBlockMethods(content);
    processBlockMethodsFound += methods.length;
    for (const method of methods) {
      const unsafe = scanForUnsafeOps(method.body, method.startLine);
      for (const finding of unsafe) {
        findings.push({ ...finding, file: file.relPath, method: method.name });
      }
    }
  }

  // Sort: blocker → major → minor, then by file/line
  const sevRank = { blocker: 0, major: 1, minor: 2 };
  findings.sort((a, b) => {
    const r = sevRank[a.severity] - sevRank[b.severity];
    if (r !== 0) return r;
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  return {
    rootPath: projectPath,
    filesScanned: model.cppFiles.length,
    processBlockMethodsFound,
    findings,
    summary: {
      blocker: findings.filter((f) => f.severity === "blocker").length,
      major: findings.filter((f) => f.severity === "major").length,
      minor: findings.filter((f) => f.severity === "minor").length,
    },
  };
}
