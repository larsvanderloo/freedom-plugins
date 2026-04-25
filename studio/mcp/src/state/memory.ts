// Cross-session persistent memory.
// Stores decisions in a project-local .claude-state/decisions.jsonl
// (append-only log) so future sessions know what was decided.

import { promises as fs } from "node:fs";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import crypto from "node:crypto";

export interface DecisionRecord {
  id: string;
  type: string;
  value: unknown;
  timestamp: string;
  notes?: string;
}

const STATE_DIR = ".claude-state";
const DECISIONS_FILE = "decisions.jsonl";

export async function ensureStateDir(rootPath: string): Promise<string> {
  const dir = join(rootPath, STATE_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    // Write a .gitignore so the dir doesn't accidentally pollute git
    await fs.writeFile(join(dir, ".gitignore"), "# studio-mcp local state\n");
  }
  return dir;
}

export async function recordDecision(
  rootPath: string,
  type: string,
  value: unknown,
  notes?: string,
): Promise<DecisionRecord> {
  const dir = await ensureStateDir(rootPath);
  const record: DecisionRecord = {
    id: crypto.randomBytes(6).toString("hex"),
    type,
    value,
    timestamp: new Date().toISOString(),
    notes,
  };
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(join(dir, DECISIONS_FILE), line);
  return record;
}

export async function listDecisions(rootPath: string, type?: string): Promise<DecisionRecord[]> {
  const path = join(rootPath, STATE_DIR, DECISIONS_FILE);
  if (!existsSync(path)) return [];
  try {
    const content = await fs.readFile(path, "utf8");
    const records = content
      .split("\n")
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line) as DecisionRecord;
        } catch {
          return null;
        }
      })
      .filter((r): r is DecisionRecord => r !== null);
    return type ? records.filter(r => r.type === type) : records;
  } catch {
    return [];
  }
}
