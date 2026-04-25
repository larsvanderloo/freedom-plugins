import { buildProjectModel, type Domain } from "../state/project-model.js";

export interface PluginRecommendation {
  name: string;
  reason: string;
  priority: "essential" | "recommended" | "optional";
}

const DOMAIN_TO_PLUGIN: Record<Domain, { name: string; reason: string } | null> = {
  audio: { name: "audio-plugin-freedom", reason: "JUCE / DSP project detected" },
  figma: { name: "figma-plugin-freedom", reason: "Figma plugin manifest + code.ts detected" },
  webapp: { name: "webapp-freedom", reason: "Web framework dependencies detected" },
  cli: { name: "cli-tool-freedom", reason: "CLI project markers detected (Cargo.toml / pyproject.toml / go.mod / CLI-SPEC.md)" },
  hardware: { name: "hardware-product-freedom", reason: "Hardware artefacts detected (HARDWARE-BRIEF / ELECTRONICS-ARCH / BOM / CAD-SPEC)" },
  marketing: { name: "marketing-team-freedom", reason: "Brand artefacts detected (POSITIONING / AUDIENCE / BRAND-VOICE)" },
  general: null,
};

export async function recommendPlugins(rootPath: string): Promise<{
  recommendations: PluginRecommendation[];
  detectedDomains: Domain[];
  installCommand: string;
}> {
  const model = await buildProjectModel(rootPath);
  const recs: PluginRecommendation[] = [];

  // studio is always essential as the overlay
  recs.push({
    name: "studio",
    reason: "Overlay — orchestration + handoff docs + CHANGELOG continuity + rollback discipline",
    priority: "essential",
  });

  // Add domain-specific plugins
  for (const domain of model.detectedDomains) {
    const entry = DOMAIN_TO_PLUGIN[domain];
    if (entry) {
      recs.push({
        name: entry.name,
        reason: entry.reason,
        priority: "essential",
      });
    }
  }

  // If multiple domains detected, suggest a follow-up
  if (model.detectedDomains.filter(d => d !== "general").length >= 2) {
    recs.push({
      name: "(multi-domain note)",
      reason: `Project spans ${model.detectedDomains.length} domains — load all detected domain plugins simultaneously; studio coordinates across them.`,
      priority: "recommended",
    });
  }

  // Build the install command
  const pluginNames = recs
    .filter(r => !r.name.startsWith("("))
    .map(r => r.name);
  const installCommand = pluginNames
    .map(p => `--plugin-dir ~/Documents/Claude/claude-plugins/${p}`)
    .join(" \\\n  ");

  return {
    recommendations: recs,
    detectedDomains: model.detectedDomains,
    installCommand: `claude \\\n  ${installCommand}`,
  };
}
