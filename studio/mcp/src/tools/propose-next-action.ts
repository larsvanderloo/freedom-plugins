import { buildProjectModel, type ProjectModel, type Domain } from "../state/project-model.js";

export interface NextActionProposal {
  currentState: string;
  conflicts: string[];
  recommendedActions: ActionItem[];
  risks: string[];
}

export interface ActionItem {
  step: number;
  task: string;
  dispatchTarget: string;
  effort: string;
}

export async function proposeNextAction(rootPath: string): Promise<NextActionProposal> {
  const model = await buildProjectModel(rootPath);

  const stateSummary = synthesizeState(model);
  const conflicts = findConflicts(model);
  const actions = recommendNextSteps(model);
  const risks = identifyRisks(model);

  return {
    currentState: stateSummary,
    conflicts,
    recommendedActions: actions,
    risks,
  };
}

function synthesizeState(m: ProjectModel): string {
  const parts: string[] = [];

  if (m.gitState) {
    parts.push(`Branch: ${m.gitState.branch}`);
    if (m.gitState.uncommittedFiles.length > 0) {
      parts.push(`${m.gitState.uncommittedFiles.length} uncommitted files`);
    }
    if (m.gitState.recentTags.length > 0) {
      parts.push(`Latest tag: ${m.gitState.recentTags[0]}`);
    }
  }

  if (m.changelogTopVersion) {
    parts.push(`CHANGELOG top: ${m.changelogTopVersion}`);
  }

  if (m.detectedDomains.length > 0 && !(m.detectedDomains.length === 1 && m.detectedDomains[0] === "general")) {
    parts.push(`Domain(s): ${m.detectedDomains.join(", ")}`);
  }

  parts.push(`Artefacts: ${m.artefacts.length} state files committed`);

  if (m.handoffs.length > 0) {
    parts.push(`Open handoffs: ${m.handoffs.length}`);
  }

  const openBacklog = m.backlogItems.filter(b => b.status !== "CLOSED");
  if (openBacklog.length > 0) {
    parts.push(`Open backlog items: ${openBacklog.length} (${m.backlogItems.length} total)`);
  }

  return parts.join(". ") + ".";
}

function findConflicts(m: ProjectModel): string[] {
  const conflicts: string[] = [];

  // Hardware: check for stage-gate conflicts
  if (m.detectedDomains.includes("hardware")) {
    const hasResearch = m.artefacts.some(a => a.category === "research" && a.domain === "hardware");
    const hasConcepts = m.artefacts.some(a => a.category === "concept");
    const hasCadSpec = m.artefacts.some(a => a.path.includes("CAD-SPEC"));
    const hasMaterials = m.artefacts.some(a => a.path.endsWith("MATERIALS.md"));
    const hasElectronics = m.artefacts.some(a => a.path.endsWith("ELECTRONICS-ARCH.md"));

    if (hasCadSpec && !hasConcepts) {
      conflicts.push("CAD-SPEC exists but no concepts/ — concept-selection step skipped or files missing.");
    }
    if (hasCadSpec && !hasMaterials) {
      conflicts.push("CAD-SPEC exists but MATERIALS.md missing — materials decisions not committed.");
    }
    if (hasElectronics && !hasCadSpec) {
      conflicts.push("ELECTRONICS-ARCH exists but no CAD-SPEC — enclosure interior dimensions unknown to electronics design.");
    }
  }

  // Webapp: check for plan-gate sequence
  if (m.detectedDomains.includes("webapp")) {
    const hasBrief = m.artefacts.some(a => a.path.endsWith("PRODUCT-BRIEF.md"));
    const hasStack = m.artefacts.some(a => a.path.endsWith("STACK.md"));
    const hasSchema = m.artefacts.some(a => a.path.endsWith("SCHEMA.md"));
    const hasApi = m.artefacts.some(a => a.path.endsWith("API.md"));

    if (hasApi && !hasSchema) conflicts.push("API.md exists but SCHEMA.md missing — endpoints reference undefined entities.");
    if (hasSchema && !hasStack) conflicts.push("SCHEMA.md exists but STACK.md missing — ORM choice undefined.");
    if (hasStack && !hasBrief) conflicts.push("STACK.md exists but PRODUCT-BRIEF.md missing — stack decided without product context.");
  }

  // CLI: check for spec-impl mismatch
  if (m.detectedDomains.includes("cli")) {
    const hasSpec = m.artefacts.some(a => a.path.endsWith("CLI-SPEC.md"));
    const hasLanguage = m.artefacts.some(a => a.path.endsWith("LANGUAGE.md"));
    if (hasLanguage && !hasSpec) conflicts.push("LANGUAGE.md committed but CLI-SPEC.md missing — implementation chosen before spec.");
  }

  // Marketing: positioning gate
  if (m.detectedDomains.includes("marketing")) {
    const hasPositioning = m.artefacts.some(a => a.path.endsWith("POSITIONING.md"));
    const hasAudience = m.artefacts.some(a => a.path.endsWith("AUDIENCE.md"));
    const hasBrandVoice = m.artefacts.some(a => a.path.endsWith("BRAND-VOICE.md"));
    const hasCampaigns = m.artefacts.some(a => a.domain === "marketing" && a.path.includes("/campaigns/"));

    if (hasCampaigns && !(hasPositioning && hasAudience && hasBrandVoice)) {
      conflicts.push("Campaigns exist but strategy files (POSITIONING / AUDIENCE / BRAND-VOICE) incomplete — copy built on shaky foundation.");
    }
  }

  return conflicts;
}

function recommendNextSteps(m: ProjectModel): ActionItem[] {
  const actions: ActionItem[] = [];
  let step = 0;

  // If there are open handoffs, those usually take precedence
  if (m.handoffs.length > 0) {
    const inProgress = m.handoffs.filter(h => /in.progress|active|wip/i.test(h.status));
    if (inProgress.length > 0) {
      actions.push({
        step: ++step,
        task: `Resume open handoff: "${inProgress[0].topic}"`,
        dispatchTarget: `Read ${inProgress[0].path} and run /studio:investigation-branch`,
        effort: "session-dependent",
      });
    }
  }

  // If no domain detected, suggest plugin recommendations first
  if (m.detectedDomains.length === 1 && m.detectedDomains[0] === "general") {
    actions.push({
      step: ++step,
      task: "Identify project domain — no specific domain artefacts detected yet.",
      dispatchTarget: "Use studio:propose_next_action with more context, or run mcp__studio__recommend_plugins after creating initial artefacts.",
      effort: "varies",
    });
    return actions;
  }

  // Per-domain next-step heuristics
  for (const domain of m.detectedDomains) {
    if (domain === "general") continue;
    const next = nextStepForDomain(domain, m);
    if (next) actions.push({ step: ++step, ...next });
  }

  // If there are uncommitted files, suggest committing
  if (m.gitState && m.gitState.uncommittedFiles.length > 0) {
    actions.push({
      step: ++step,
      task: `Review + commit ${m.gitState.uncommittedFiles.length} uncommitted files before starting new work`,
      dispatchTarget: "manual review + commit",
      effort: "5 min",
    });
  }

  // If there are open backlog items, suggest looking at them
  const openBacklog = m.backlogItems.filter(b => b.status === "OPEN" || b.status === "IN_PROGRESS");
  if (openBacklog.length > 0 && actions.length < 2) {
    actions.push({
      step: ++step,
      task: `Review BACKLOG.md — ${openBacklog.length} open item(s)`,
      dispatchTarget: "/studio:backlog",
      effort: "5-10 min",
    });
  }

  return actions;
}

function nextStepForDomain(domain: Domain, m: ProjectModel): Omit<ActionItem, "step"> | null {
  const has = (path: string) => m.artefacts.some(a => a.path.endsWith(path) || a.path.includes(path));

  if (domain === "hardware") {
    if (!has("HARDWARE-BRIEF.md")) {
      return { task: "Hardware project: write HARDWARE-BRIEF.md (volume, price, geography decisions)", dispatchTarget: "manual decision", effort: "30 min" };
    }
    if (!has("RESEARCH-BRIEF.md")) {
      return { task: "No research artefacts. Dispatch industrial-research agent", dispatchTarget: "industrial-research agent OR /hardware-product-freedom:concept", effort: "1 session" };
    }
    if (m.artefacts.filter(a => a.category === "concept").length === 0) {
      return { task: "Generate 2-4 concept directions", dispatchTarget: "/hardware-product-freedom:concept", effort: "1 hour" };
    }
    if (!has("CAD-SPEC")) {
      return { task: "Concepts exist — pick one and produce CAD-SPEC", dispatchTarget: "/hardware-product-freedom:cad-spec", effort: "2 hours" };
    }
    if (!has("ELECTRONICS-ARCH.md")) {
      return { task: "CAD spec ready — define electronics architecture", dispatchTarget: "/hardware-product-freedom:electronics-arch", effort: "1-2 hours" };
    }
    if (!has("BOM")) {
      return { task: "Schematic + electronics defined — build BOM with supply-chain audit", dispatchTarget: "/hardware-product-freedom:bom-audit", effort: "1 hour" };
    }
    return { task: "Hardware design complete — proceed to compliance + manufacturing", dispatchTarget: "/hardware-product-freedom:compliance OR /hardware-product-freedom:cm-select", effort: "2-3 sessions" };
  }

  if (domain === "webapp") {
    if (!has("PRODUCT-BRIEF.md")) {
      return { task: "Webapp project: write PRODUCT-BRIEF.md", dispatchTarget: "/webapp-freedom:plan", effort: "30 min" };
    }
    if (!has("STACK.md")) {
      return { task: "Pick stack and commit STACK.md", dispatchTarget: "/webapp-freedom:plan (continues from brief)", effort: "20 min" };
    }
    if (!has("SCHEMA.md")) {
      return { task: "Design schema", dispatchTarget: "/webapp-freedom:plan (data-model agent)", effort: "30 min" };
    }
    if (!has("API.md")) {
      return { task: "Design API contract", dispatchTarget: "/webapp-freedom:plan (api-design agent)", effort: "30 min" };
    }
    return { task: "Contracts committed — scaffold or add features", dispatchTarget: "/webapp-freedom:scaffold OR /webapp-freedom:endpoint", effort: "varies" };
  }

  if (domain === "audio") {
    if (!has("dsp-research.md")) {
      return { task: "Audio plugin: research the DSP target", dispatchTarget: "/audio-plugin-freedom:dsp-research", effort: "1-2 sessions" };
    }
    if (!has("architecture.md") && !has("plan.md")) {
      return { task: "Research done — plan the implementation", dispatchTarget: "/audio-plugin-freedom:plugin-planning", effort: "1 session" };
    }
    return { task: "Plan committed — proceed to implementation", dispatchTarget: "/audio-plugin-freedom:plugin-workflow", effort: "multi-session" };
  }

  if (domain === "marketing") {
    if (!has("POSITIONING.md") || !has("AUDIENCE.md") || !has("BRAND-VOICE.md")) {
      return { task: "Marketing: complete strategy artefacts (POSITIONING / AUDIENCE / BRAND-VOICE)", dispatchTarget: "strategist agent", effort: "1-2 hours" };
    }
    return { task: "Strategy ready — write a campaign brief", dispatchTarget: "/marketing-team-freedom:brief", effort: "20-30 min" };
  }

  if (domain === "figma") {
    if (!has("manifest.json")) {
      return { task: "Figma plugin: scaffold project", dispatchTarget: "/figma-plugin-freedom:scaffold", effort: "10 min" };
    }
    return { task: "Plugin scaffolded — add a command", dispatchTarget: "/figma-plugin-freedom:add-command", effort: "30 min" };
  }

  if (domain === "cli") {
    if (!has("CLI-SPEC.md")) {
      return { task: "CLI: define spec", dispatchTarget: "/cli-tool-freedom:scaffold (calls cli-design)", effort: "30 min" };
    }
    return { task: "Spec committed — add commands or release", dispatchTarget: "/cli-tool-freedom:command OR /cli-tool-freedom:release", effort: "varies" };
  }

  return null;
}

function identifyRisks(m: ProjectModel): string[] {
  const risks: string[] = [];

  if (m.gitState && m.gitState.ahead > 0) {
    risks.push(`${m.gitState.ahead} commit(s) ahead of origin — push before further architectural changes.`);
  }

  if (m.handoffs.length > 1) {
    risks.push(`${m.handoffs.length} open handoffs — risk of context-switching cost; consider closing one before opening more.`);
  }

  const inProgress = m.backlogItems.filter(b => b.status === "IN_PROGRESS");
  if (inProgress.length > 1) {
    risks.push(`${inProgress.length} BACKLOG items marked IN_PROGRESS simultaneously — pick ONE to focus on.`);
  }

  return risks;
}
