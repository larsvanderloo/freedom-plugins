// Per-domain phase detection — what stage is each domain in?

import { buildProjectModel, type Domain } from "../state/project-model.js";

export interface DomainPhase {
  domain: Domain;
  phase: string;
  next: string | null;
  artefactsCommitted: number;
  artefactsExpected: number;
  percentComplete: number;
}

export async function findActivePhase(rootPath: string): Promise<DomainPhase[]> {
  const m = await buildProjectModel(rootPath);
  const out: DomainPhase[] = [];

  for (const domain of m.detectedDomains) {
    if (domain === "general") continue;

    const has = (path: string) => m.artefacts.some(a => a.path.endsWith(path) || a.path.includes(path));

    if (domain === "hardware") {
      const checkpoints = [
        { name: "strategy", file: "HARDWARE-BRIEF.md" },
        { name: "research", file: "RESEARCH-BRIEF.md" },
        { name: "concept-direction", file: "concepts/" },
        { name: "cad-spec", file: "CAD-SPEC" },
        { name: "materials", file: "MATERIALS.md" },
        { name: "electronics-arch", file: "ELECTRONICS-ARCH.md" },
        { name: "schematic-pcb", file: "SCHEMATIC-SPEC.md" },
        { name: "bom", file: "BOM" },
        { name: "compliance", file: "COMPLIANCE-ROADMAP.md" },
        { name: "dfm-review", file: "DFM-REVIEW.md" },
        { name: "manufacturing", file: "MANUFACTURING-PLAN.md" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : null,
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }

    else if (domain === "webapp") {
      const checkpoints = [
        { name: "product-brief", file: "PRODUCT-BRIEF.md" },
        { name: "stack-decided", file: "STACK.md" },
        { name: "schema", file: "SCHEMA.md" },
        { name: "api-design", file: "API.md" },
        { name: "scaffold", file: "package.json" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : "endpoints / pages / deploy",
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }

    else if (domain === "audio") {
      const checkpoints = [
        { name: "dsp-research", file: "dsp-research.md" },
        { name: "architecture", file: "architecture.md" },
        { name: "plan", file: "plan.md" },
        { name: "implementation", file: "Source/PluginProcessor.cpp" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : "QA / packaging / release",
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }

    else if (domain === "marketing") {
      const checkpoints = [
        { name: "positioning", file: "POSITIONING.md" },
        { name: "audience", file: "AUDIENCE.md" },
        { name: "brand-voice", file: "BRAND-VOICE.md" },
        { name: "messaging", file: "MESSAGING-HIERARCHY.md" },
        { name: "calendar", file: "CONTENT-CALENDAR.md" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : "campaigns / post-mortems",
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }

    else if (domain === "figma") {
      const checkpoints = [
        { name: "scaffold", file: "manifest.json" },
        { name: "main-thread", file: "code.ts" },
        { name: "ui", file: "ui.html" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : "add-command / publish",
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }

    else if (domain === "cli") {
      const checkpoints = [
        { name: "spec", file: "CLI-SPEC.md" },
        { name: "language", file: "LANGUAGE.md" },
        { name: "scaffold", file: "package.json" },
      ];
      const completed = checkpoints.filter(c => has(c.file));
      const next = checkpoints.find(c => !has(c.file));
      out.push({
        domain,
        phase: completed.length > 0 ? completed[completed.length - 1].name : "not-started",
        next: next ? next.name : "commands / completions / release",
        artefactsCommitted: completed.length,
        artefactsExpected: checkpoints.length,
        percentComplete: Math.round((completed.length / checkpoints.length) * 100),
      });
    }
  }

  return out;
}
