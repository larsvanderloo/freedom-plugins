// Pluginval log parser.
// pluginval is a JUCE-ecosystem plugin validator (https://github.com/Tracktion/pluginval).
// Output is a wall of `Test:` / `FAIL:` / `WARN:` lines. This parser categorises
// them so the user gets a triaged punch list.

export type PluginvalSeverity = "fail" | "warn" | "skip" | "info";

export type PluginvalCategory =
  | "audio-thread-allocation"
  | "audio-thread-lock"
  | "audio-thread-fp"            // denormals, NaN, Inf
  | "param-out-of-range"
  | "state-restore"
  | "audio-output"               // silence/clipping/abnormal output
  | "format-validation"          // VST/AU specific
  | "thread"                     // general threading
  | "memory"                     // leaks, double-free
  | "init-shutdown"
  | "other";

export interface PluginvalFinding {
  severity: PluginvalSeverity;
  category: PluginvalCategory;
  line: number;          // 1-indexed in the input log
  testName: string;      // best guess of which test reported this
  message: string;
}

export interface PluginvalReport {
  totalLines: number;
  findings: PluginvalFinding[];
  passedCount: number;
  failedCount: number;
  warningCount: number;
  exitStatus: "passed" | "failed" | "unknown";
}

const CATEGORY_HINTS: Array<{ re: RegExp; cat: PluginvalCategory }> = [
  { re: /allocat/i, cat: "audio-thread-allocation" },
  { re: /(lock|mutex|critical[_ ]section|priority.*invers)/i, cat: "audio-thread-lock" },
  { re: /(denormal|nan|inf|subnormal|infinite)/i, cat: "audio-thread-fp" },
  { re: /(parameter|param).*range/i, cat: "param-out-of-range" },
  { re: /(state|preset).*restore/i, cat: "state-restore" },
  { re: /(silence|clipping|peak|clip|output level)/i, cat: "audio-output" },
  { re: /(VST3|VST2|AAX|AU |AudioUnit|component)/, cat: "format-validation" },
  { re: /(memory|leak|double[- ]free)/i, cat: "memory" },
  { re: /(init|shutdown|prepare|release)/i, cat: "init-shutdown" },
  { re: /(thread|race)/i, cat: "thread" },
];

function categorise(message: string): PluginvalCategory {
  for (const { re, cat } of CATEGORY_HINTS) {
    if (re.test(message)) return cat;
  }
  return "other";
}

export function parsePluginvalLog(content: string): PluginvalReport {
  const lines = content.split(/\r?\n/);
  const findings: PluginvalFinding[] = [];
  let currentTest = "";
  let passedCount = 0;
  let failedCount = 0;
  let warningCount = 0;
  let exitStatus: PluginvalReport["exitStatus"] = "unknown";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track current test context
    const testMatch = trimmed.match(/^(?:Test|Running):\s*(.+)$/i);
    if (testMatch) {
      currentTest = testMatch[1].trim();
      continue;
    }

    // FAIL lines
    if (/^(FAIL(URE)?|ERROR)[:!\s]/i.test(trimmed)) {
      const message = trimmed.replace(/^(FAIL(URE)?|ERROR)[:!\s]+/i, "").trim();
      findings.push({
        severity: "fail",
        category: categorise(message),
        line: i + 1,
        testName: currentTest,
        message,
      });
      failedCount++;
      continue;
    }

    // WARN lines
    if (/^WARN(ING)?[:!\s]/i.test(trimmed)) {
      const message = trimmed.replace(/^WARN(ING)?[:!\s]+/i, "").trim();
      findings.push({
        severity: "warn",
        category: categorise(message),
        line: i + 1,
        testName: currentTest,
        message,
      });
      warningCount++;
      continue;
    }

    // SKIP lines
    if (/^SKIP(PED)?[:!\s]/i.test(trimmed)) {
      const message = trimmed.replace(/^SKIP(PED)?[:!\s]+/i, "").trim();
      findings.push({
        severity: "skip",
        category: categorise(message),
        line: i + 1,
        testName: currentTest,
        message,
      });
      continue;
    }

    // PASS / OK / [success]
    if (/^(PASS(ED)?|OK|SUCCESS)[:!\s]/i.test(trimmed)) {
      passedCount++;
      continue;
    }

    // Final exit indicators
    if (/all tests passed|0 failed|finished successfully/i.test(trimmed)) {
      exitStatus = "passed";
    } else if (/tests? failed|exit\s*code\s*[1-9]|aborted/i.test(trimmed)) {
      exitStatus = "failed";
    }
  }

  // failedCount > 0 always overrides any "passed" string (the latter can appear
  // from per-section status lines that don't reflect overall outcome).
  if (failedCount > 0) exitStatus = "failed";
  else if (exitStatus === "unknown" && passedCount > 0) exitStatus = "passed";

  return {
    totalLines: lines.length,
    findings,
    passedCount,
    failedCount,
    warningCount,
    exitStatus,
  };
}
