// Open blockers — what's stopping forward progress?
// Sources: HANDOFF docs marked in-progress, BACKLOG items IN_PROGRESS or BLOCKED,
// recent test failures (best-effort detection)

import { promises as fs } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { buildProjectModel } from "../state/project-model.js";

export interface Blocker {
  source: "handoff" | "backlog" | "test-failure" | "uncommitted-wip";
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  path?: string;
}

export async function getOpenBlockers(rootPath: string): Promise<Blocker[]> {
  const m = await buildProjectModel(rootPath);
  const blockers: Blocker[] = [];

  // Open handoffs
  for (const h of m.handoffs) {
    if (/in.progress|active|wip|blocked/i.test(h.status)) {
      blockers.push({
        source: "handoff",
        severity: /blocked/i.test(h.status) ? "high" : "medium",
        title: h.topic,
        detail: `Status: ${h.status}. Modified: ${h.modified}. Read ${h.path} to resume.`,
        path: h.path,
      });
    }
  }

  // Backlog: IN_PROGRESS items (any > 1 is a focus issue) and BLOCKED
  const inProgress = m.backlogItems.filter(b => b.status === "IN_PROGRESS");
  if (inProgress.length > 1) {
    blockers.push({
      source: "backlog",
      severity: "medium",
      title: "Multiple BACKLOG items IN_PROGRESS",
      detail: `${inProgress.length} items: ${inProgress.map(b => b.id).join(", ")}. Pick ONE to focus.`,
    });
  }
  const blocked = m.backlogItems.filter(b => b.status === "BLOCKED");
  for (const b of blocked) {
    blockers.push({
      source: "backlog",
      severity: "high",
      title: `${b.id}: ${b.title}`,
      detail: "BACKLOG item marked BLOCKED — needs unblock action before resuming.",
    });
  }

  // Uncommitted WIP > N files
  if (m.gitState && m.gitState.uncommittedFiles.length > 5) {
    blockers.push({
      source: "uncommitted-wip",
      severity: "medium",
      title: `${m.gitState.uncommittedFiles.length} uncommitted files`,
      detail: "Large uncommitted state — risk of losing context. Commit or stash before pivoting.",
    });
  }

  // Test failures — best-effort detection
  // Common locations: build/test_results.json, target/test-output/, last-test-failures.txt
  const testFailureFiles = [
    "build/test_results.json",
    "target/last_test.txt",
    "last-test-failures.txt",
    ".test-failures.log",
  ];
  for (const f of testFailureFiles) {
    const path = join(rootPath, f);
    if (existsSync(path)) {
      try {
        const content = await fs.readFile(path, "utf8");
        const failureCount = (content.match(/\bfail/gi) ?? []).length;
        if (failureCount > 0) {
          blockers.push({
            source: "test-failure",
            severity: failureCount > 3 ? "high" : "medium",
            title: `Test failures detected in ${f}`,
            detail: `${failureCount} failure markers found. Resolve before further dev.`,
            path,
          });
        }
      } catch {}
    }
  }

  // Sort by severity
  const sevOrder = { high: 0, medium: 1, low: 2 };
  blockers.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  return blockers;
}
