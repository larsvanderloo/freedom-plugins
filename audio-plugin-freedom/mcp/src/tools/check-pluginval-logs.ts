import { promises as fs } from "node:fs";
import { parsePluginvalLog, type PluginvalCategory, type PluginvalReport } from "../parsers/pluginval-log.js";

export interface CheckPluginvalLogsArgs {
  logPath?: string;
  logContent?: string;
}

export interface CheckPluginvalLogsResult extends PluginvalReport {
  source: "file" | "inline";
  categoryBreakdown: Record<PluginvalCategory, { fail: number; warn: number }>;
  topPriorityFindings: PluginvalReport["findings"];
  recommendations: string[];
}

const CATEGORY_RECOMMENDATIONS: Partial<Record<PluginvalCategory, string>> = {
  "audio-thread-allocation":
    "Run scan_realtime_safety MCP tool — pluginval has detected allocations on the audio thread.",
  "audio-thread-lock":
    "Threading violation. Audit critical sections; consider lock-free state passing (FIFO, atomic).",
  "audio-thread-fp":
    "Denormal / NaN / Inf in output. Add denormal flush (FTZ/DAZ) and clamp output range; check init paths for NaN seeds.",
  "param-out-of-range":
    "Run validate_apvts_layout MCP tool — parameter clamping or range bug.",
  "state-restore":
    "getStateInformation/setStateInformation roundtrip is failing. Check ValueTree XML, version migration handling.",
  "audio-output":
    "Silence/clipping detected. Verify default parameter values, gain staging, and bypass behaviour.",
  "format-validation":
    "DAW-format-specific failure (VST3/AU/AAX). Check IDs, manifest data, and category strings.",
  "memory":
    "Memory issue (leak / double-free). Run with sanitisers (ASan/MSan) for an exact backtrace.",
  "init-shutdown":
    "prepareToPlay / releaseResources lifecycle issue. Verify resources are sized and freed in matched calls.",
  "thread":
    "General threading concern. Audit shared state for atomic/lock-free access.",
};

export async function checkPluginvalLogs(args: CheckPluginvalLogsArgs): Promise<CheckPluginvalLogsResult> {
  let content = args.logContent ?? "";
  let source: "file" | "inline" = "inline";
  if (!content && args.logPath) {
    content = await fs.readFile(args.logPath, "utf8");
    source = "file";
  }
  if (!content) {
    throw new Error("Either logPath or logContent must be provided.");
  }

  const report = parsePluginvalLog(content);

  const categoryBreakdown: Record<PluginvalCategory, { fail: number; warn: number }> = {
    "audio-thread-allocation": { fail: 0, warn: 0 },
    "audio-thread-lock": { fail: 0, warn: 0 },
    "audio-thread-fp": { fail: 0, warn: 0 },
    "param-out-of-range": { fail: 0, warn: 0 },
    "state-restore": { fail: 0, warn: 0 },
    "audio-output": { fail: 0, warn: 0 },
    "format-validation": { fail: 0, warn: 0 },
    "thread": { fail: 0, warn: 0 },
    "memory": { fail: 0, warn: 0 },
    "init-shutdown": { fail: 0, warn: 0 },
    "other": { fail: 0, warn: 0 },
  };
  for (const f of report.findings) {
    if (f.severity === "fail") categoryBreakdown[f.category].fail++;
    else if (f.severity === "warn") categoryBreakdown[f.category].warn++;
  }

  // Top priority — fails first, then warns; capped at 10 for triage
  const topPriorityFindings = report.findings
    .filter((f) => f.severity === "fail" || f.severity === "warn")
    .sort((a, b) => (a.severity === "fail" ? 0 : 1) - (b.severity === "fail" ? 0 : 1))
    .slice(0, 10);

  const recommendations: string[] = [];
  const seen = new Set<PluginvalCategory>();
  for (const f of report.findings) {
    if (f.severity !== "fail") continue;
    if (seen.has(f.category)) continue;
    seen.add(f.category);
    const rec = CATEGORY_RECOMMENDATIONS[f.category];
    if (rec) recommendations.push(rec);
  }
  if (report.exitStatus === "passed" && report.warningCount === 0) {
    recommendations.push("All tests passed and no warnings — proceed to /audio-plugin-freedom:plugin-packaging.");
  } else if (report.exitStatus === "passed" && report.warningCount > 0) {
    recommendations.push("Tests passed but with warnings — triage the top warnings before packaging.");
  }

  return {
    ...report,
    source,
    categoryBreakdown,
    topPriorityFindings,
    recommendations,
  };
}
