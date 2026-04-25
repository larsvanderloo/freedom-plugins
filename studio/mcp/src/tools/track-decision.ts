// Cross-session memory — record + retrieve decisions made during a project.
// Decisions persist across Claude Code sessions in .claude-state/decisions.jsonl

import { recordDecision, listDecisions, type DecisionRecord } from "../state/memory.js";

export async function trackDecision(
  rootPath: string,
  type: string,
  value: unknown,
  notes?: string,
): Promise<DecisionRecord> {
  return recordDecision(rootPath, type, value, notes);
}

export async function getDecisions(
  rootPath: string,
  type?: string,
): Promise<DecisionRecord[]> {
  return listDecisions(rootPath, type);
}
