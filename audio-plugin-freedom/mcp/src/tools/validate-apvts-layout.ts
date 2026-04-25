import { promises as fs } from "node:fs";
import { buildAudioProjectModel } from "../state/audio-project.js";
import { extractApvtsParameters, type ApvtsParameter } from "../parsers/apvts-layout.js";

export interface ApvtsValidationIssue {
  severity: "error" | "warning";
  kind: string;
  paramId: string | null;
  file: string;            // relative
  line: number;
  message: string;
}

export interface ValidateApvtsLayoutResult {
  rootPath: string;
  filesScanned: number;
  parametersFound: number;
  parameters: Array<ApvtsParameter & { file: string }>;
  issues: ApvtsValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
  };
}

const ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export async function validateApvtsLayout(projectPath: string): Promise<ValidateApvtsLayoutResult> {
  const model = await buildAudioProjectModel(projectPath);
  const allParams: Array<ApvtsParameter & { file: string }> = [];

  for (const file of model.cppFiles) {
    let content = "";
    try {
      content = await fs.readFile(file.path, "utf8");
    } catch {
      continue;
    }
    if (!/AudioParameter(Float|Int|Bool|Choice)/.test(content)) continue;
    const params = extractApvtsParameters(content);
    for (const p of params) allParams.push({ ...p, file: file.relPath });
  }

  const issues: ApvtsValidationIssue[] = [];

  // Duplicate ID detection
  const idSeen = new Map<string, Array<ApvtsParameter & { file: string }>>();
  for (const p of allParams) {
    const list = idSeen.get(p.id) ?? [];
    list.push(p);
    idSeen.set(p.id, list);
  }
  for (const [id, list] of idSeen) {
    if (list.length > 1) {
      for (const dup of list) {
        issues.push({
          severity: "error",
          kind: "duplicate-id",
          paramId: id,
          file: dup.file,
          line: dup.sourceLine,
          message: `Parameter ID "${id}" declared ${list.length} times. APVTS requires unique IDs; later declarations are silently ignored.`,
        });
      }
    }
  }

  // Per-parameter sanity
  for (const p of allParams) {
    if (!p.id) {
      issues.push({
        severity: "error",
        kind: "empty-id",
        paramId: null,
        file: p.file,
        line: p.sourceLine,
        message: "Parameter ID is empty.",
      });
      continue;
    }
    if (!ID_PATTERN.test(p.id)) {
      issues.push({
        severity: "warning",
        kind: "id-format",
        paramId: p.id,
        file: p.file,
        line: p.sourceLine,
        message: `Parameter ID "${p.id}" contains characters that are unusual for APVTS IDs (recommended: [A-Za-z][A-Za-z0-9_]*).`,
      });
    }

    if (p.type === "float" || p.type === "int") {
      if (p.min !== null && p.max !== null && p.min >= p.max) {
        issues.push({
          severity: "error",
          kind: "min-max",
          paramId: p.id,
          file: p.file,
          line: p.sourceLine,
          message: `Parameter "${p.id}" has min (${p.min}) >= max (${p.max}).`,
        });
      }
      if (
        p.min !== null && p.max !== null &&
        typeof p.defaultValue === "number" &&
        (p.defaultValue < p.min || p.defaultValue > p.max)
      ) {
        issues.push({
          severity: "error",
          kind: "default-out-of-range",
          paramId: p.id,
          file: p.file,
          line: p.sourceLine,
          message: `Parameter "${p.id}" default (${p.defaultValue}) is outside [${p.min}, ${p.max}].`,
        });
      }
    }

    if (p.type === "choice") {
      if (!p.choices || p.choices.length === 0) {
        issues.push({
          severity: "error",
          kind: "empty-choices",
          paramId: p.id,
          file: p.file,
          line: p.sourceLine,
          message: `Choice parameter "${p.id}" has no parsed choices.`,
        });
      } else if (
        p.defaultIndex !== null &&
        (p.defaultIndex < 0 || p.defaultIndex >= p.choices.length)
      ) {
        issues.push({
          severity: "error",
          kind: "default-index-out-of-range",
          paramId: p.id,
          file: p.file,
          line: p.sourceLine,
          message: `Choice parameter "${p.id}" defaultIndex ${p.defaultIndex} is outside [0, ${p.choices.length - 1}].`,
        });
      }
    }
  }

  // Duplicate display names — warning only, sometimes intentional in groups
  const nameSeen = new Map<string, Array<ApvtsParameter & { file: string }>>();
  for (const p of allParams) {
    if (!p.name) continue;
    const list = nameSeen.get(p.name) ?? [];
    list.push(p);
    nameSeen.set(p.name, list);
  }
  for (const [name, list] of nameSeen) {
    if (list.length > 1) {
      for (const dup of list) {
        issues.push({
          severity: "warning",
          kind: "duplicate-display-name",
          paramId: dup.id,
          file: dup.file,
          line: dup.sourceLine,
          message: `Display name "${name}" used by ${list.length} parameters. Consider scoping (e.g. "Drive Stage 1" / "Drive Stage 2").`,
        });
      }
    }
  }

  return {
    rootPath: projectPath,
    filesScanned: model.cppFiles.length,
    parametersFound: allParams.length,
    parameters: allParams,
    issues,
    summary: {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
    },
  };
}
