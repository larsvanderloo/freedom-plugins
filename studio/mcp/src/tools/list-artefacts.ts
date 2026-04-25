// List committed project state artefacts, grouped by domain + category.

import { buildProjectModel, type Artefact, type Domain } from "../state/project-model.js";

export interface ArtefactListing {
  byDomain: Record<string, Artefact[]>;
  total: number;
  detectedDomains: Domain[];
  recent: Artefact[];   // 5 most recently modified
}

export async function listCommittedArtefacts(rootPath: string): Promise<ArtefactListing> {
  const m = await buildProjectModel(rootPath);

  const byDomain: Record<string, Artefact[]> = {};
  for (const a of m.artefacts) {
    const key = String(a.domain);
    if (!byDomain[key]) byDomain[key] = [];
    byDomain[key].push(a);
  }

  // Sort each by category then path
  for (const key of Object.keys(byDomain)) {
    byDomain[key].sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.path.localeCompare(b.path);
    });
  }

  const recent = [...m.artefacts]
    .sort((a, b) => (b.modified > a.modified ? 1 : -1))
    .slice(0, 5);

  return {
    byDomain,
    total: m.artefacts.length,
    detectedDomains: m.detectedDomains,
    recent,
  };
}
